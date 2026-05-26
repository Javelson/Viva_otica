-- INSERT SAMPLE PRODUCTS FOR VIVA OPTICA

INSERT INTO public.produtos (nome, preco, categoria, imagem_url, estoque, ativo) VALUES
('Armação Ray-Ban RB3025', 45.99, 'Armacao', 'https://via.placeholder.com/300x200?text=Ray-Ban+RB3025', 5, true),
('Armação Oakley Holbrook', 52.50, 'Armacao', 'https://via.placeholder.com/300x200?text=Oakley+Holbrook', 3, true),
('Armação Aviador Clássica', 35.00, 'Armacao', 'https://via.placeholder.com/300x200?text=Aviador', 8, true),
('Lente Progressiva Anti-Reflexo', 89.90, 'Lente', 'https://via.placeholder.com/300x200?text=Lente+Progressiva', 10, true),
('Lente Fotossensível', 75.50, 'Lente', 'https://via.placeholder.com/300x200?text=Lente+Fotossensivel', 6, true),
('Lente Polarizada UV400', 65.00, 'Lente', 'https://via.placeholder.com/300x200?text=Lente+Polarizada', 7, true),
('Estojo para Óculos Premium', 12.99, 'Acessorio', 'https://via.placeholder.com/300x200?text=Estojo', 15, true),
('Pano de Limpeza Microfibra', 2.50, 'Acessorio', 'https://via.placeholder.com/300x200?text=Pano', 20, true),
('Haste de Reparo Flexível', 8.00, 'Acessorio', 'https://via.placeholder.com/300x200?text=Haste', 12, true),
('Corrente para Óculos', 5.99, 'Acessorio', 'https://via.placeholder.com/300x200?text=Corrente', 18, true);

-- Verify insertion
SELECT COUNT(*) as total_produtos FROM public.produtos;
