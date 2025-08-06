import { Request, Response } from 'express';
import { createProduct, getAllProducts, getProductById } from '../services/productService';

export const createProductHandler = async (req: Request, res: Response) => {
  try {
    const { name, description, price, quantity, imageUrl, supplierId } = req.body;
    if (!name || !price || !quantity || !imageUrl || !supplierId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const product = await createProduct({
      name,
      description,
      price: Number(price),
      quantity: Number(quantity),
      imageUrl,
      supplierId: Number(supplierId),
    });
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create product', details: err instanceof Error ? err.message : err });
  }
};

export const getAllProductsHandler = async (req: Request, res: Response) => {
  try {
    const products = await getAllProducts();
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch products', details: err instanceof Error ? err.message : err });
  }
};

export const getProductByIdHandler = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid product id' });
    const product = await getProductById(id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch product', details: err instanceof Error ? err.message : err });
  }
};