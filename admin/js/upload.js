// ============================================
// Upload de Imagens para Supabase Storage
// ============================================

const UploadManager = {
  // Supabase client
  supabase: window.supabase.createClient(
    'https://cfsunlyqinxgzasjmjwc.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmY3VzbHlxaW54Z3phc2ptandjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwNjQ3NzMsImV4cCI6MjA2MDY0MDc3M30.JxKLKCKhPZFGRJNpJJGYNpWrJxlqJLGvqXTKMGPFPWc'
  ),

  // Configurações
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  MAX_IMAGE_WIDTH: 1920, // Max width for resized images
  IMAGE_QUALITY: 0.8, // WebP quality (0-1)

  /**
   * Redimensionar imagem usando Canvas
   * @param {File} file - Arquivo de imagem original
   * @param {number} maxWidth -largura máxima (default 1920)
   * @returns {Promise<Blob>} - Blob da imagem redimensionada em WebP
   */
  resizeImage(file, maxWidth = this.MAX_IMAGE_WIDTH) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          // Calcular novas dimensões mantendo aspect ratio
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }

          // Criar canvas para redimensionar
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          // Converter para WebP
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error('Falha ao redimensionar imagem'));
              }
            },
            'image/webp',
            this.IMAGE_QUALITY
          );
        };
        img.onerror = () => reject(new Error('Falha ao carregar imagem'));
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },

  /**
   * Upload de imagem para um bucket específico
   * @param {string} bucket - Nome do bucket (banners ou produtos-imgs)
   * @param {File} file - Arquivo de imagem
   * @param {boolean} resize - Se deve redimensionar (default true para produtos, false para banners)
   * @returns {Promise<string>} - URL pública da imagem
   */
  async uploadImage(bucket, file, resize = true) {
    if (!this.supabase) this.init();
    if (!this.supabase) throw new Error('Supabase não inicializado');

    try {
      // Validações
      if (!this.ALLOWED_TYPES.includes(file.type)) {
        throw new Error('Tipo de arquivo não permitido. Use JPG, PNG, WEBP ou GIF.');
      }

      if (file.size > this.MAX_FILE_SIZE) {
        throw new Error('Arquivo muito grande. Máximo 5MB.');
      }

      // Redimensionar se for imagem e resize = true
      let uploadFile = file;
      if (resize && file.type.startsWith('image/')) {
        try {
          uploadFile = await this.resizeImage(file);
          console.log(`Imagem redimensionada: ${file.name} -> ${uploadFile.size} bytes`);
        } catch (resizeError) {
          console.warn('Falha ao redimensionar, usando original:', resizeError);
          uploadFile = file;
        }
      }

      // Gerar nome único para o arquivo
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(7);
      const fileName = `${bucket}/${timestamp}_${randomStr}_${file.name}`;

      // Upload
      const { data, error } = await this.supabase.storage
        .from(bucket)
        .upload(fileName, uploadFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Erro no upload:', error);
        throw error;
      }

      // Obter URL pública
      const { data: urlData } = this.supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      return urlData.publicUrl;

    } catch (error) {
      console.error('Erro no UploadManager.uploadImage:', error);
      throw error;
    }
  },

  /**
   * Apagar imagem do Storage
   * @param {string} bucket - Nome do bucket
   * @param {string} imageUrl - URL completa da imagem
   */
  async deleteImage(bucket, imageUrl) {
    if (!this.supabase) this.init();
    if (!this.supabase) throw new Error('Supabase não inicializado');

    try {
      if (!imageUrl) return;

      // Extrair o path da URL
      const url = new URL(imageUrl);
      const path = url.pathname.substring(1); // Remove o primeiro '/'

      // Apagar arquivo
      const { error } = await this.supabase.storage
        .from(bucket)
        .remove([path]);

      if (error) {
        console.error('Erro ao apagar imagem:', error);
        // Não lançar erro - pode ser que a imagem já não exista
      }

    } catch (error) {
      console.error('Erro no UploadManager.deleteImage:', error);
      // Não lançar erro - continua a operação
    }
  },

  /**
   * Preview de imagem antes do upload
   * @param {File} file - Arquivo de imagem
   * @returns {Promise<string>} - URL temporária para preview
   */
  previewImage(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },

  /**
   * Validar arquivo de imagem
   * @param {File} file - Arquivo a validar
   * @returns {object} - { valid: boolean, error: string|null }
   */
  validateFile(file) {
    if (!file) {
      return { valid: false, error: 'Nenhum arquivo selecionado.' };
    }

    if (!this.ALLOWED_TYPES.includes(file.type)) {
      return {
        valid: false,
        error: 'Tipo de arquivo não permitido. Use JPG, PNG, WEBP ou GIF.'
      };
    }

    if (file.size > this.MAX_FILE_SIZE) {
      return {
        valid: false,
        error: 'Arquivo muito grande. Máximo 5MB.'
      };
    }

    return { valid: true, error: null };
  }
};

// Exportar para uso global
window.UploadManager = UploadManager;

// Expor globalmente também como window.uploadImage e window.deleteImage para compatibilidade
window.uploadImage = async (bucket, file) => {
  return await UploadManager.uploadImage(bucket, file);
};

window.deleteImage = async (bucket, imageUrl) => {
  return await UploadManager.deleteImage(bucket, imageUrl);
};
