'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { AppShell } from '../../components/layout/AppShell';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Table, Column } from '../../components/ui/Table';
import { useToast } from '../../context/ToastContext';
import { getSellerProductsApi, updateSellerProductStockApi } from '../../lib/api/products';
import { Product } from '../../types';
import { Boxes, RefreshCw } from 'lucide-react';

export default function InventoryPage() {
  const toast = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [stockValues, setStockValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadInventory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getSellerProductsApi('all');
      setProducts(result);
      setStockValues(Object.fromEntries(result.map((product) => [product.id, String(product.stock)])));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load inventory.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadInventory();
  }, [loadInventory]);

  const saveStock = async (product: Product) => {
    const stock = Number(stockValues[product.id]);
    if (!Number.isInteger(stock) || stock < 0) {
      setError('Stock must be a non-negative whole number.');
      return;
    }

    setSavingId(product.id);
    setError(null);
    try {
      const updatedProduct = await updateSellerProductStockApi(product.id, stock);
      setProducts((current) =>
        current.map((item) => (item.id === updatedProduct.id ? updatedProduct : item)),
      );
      setStockValues((current) => ({ ...current, [updatedProduct.id]: String(updatedProduct.stock) }));
      toast.success('Inventory updated', `Stock is now ${updatedProduct.stock} for ${updatedProduct.name}.`);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to update stock.');
    } finally {
      setSavingId(null);
    }
  };

  const columns: Column<Product>[] = [
    {
      header: 'Product',
      cell: (product) => (
        <div>
          <p className="font-semibold text-white">{product.name}</p>
          <p className="text-xs text-slate-400">{product.sku || 'No SKU'}</p>
        </div>
      ),
    },
    {
      header: 'Status',
      cell: (product) => <span className="text-xs capitalize text-slate-300">{product.status}</span>,
    },
    {
      header: 'Available stock',
      cell: (product) => (
        <span className="text-sm text-slate-200">{product.stock}</span>
      ),
    },
    {
      header: 'Update stock',
      cell: (product) => (
        <div className="flex items-end gap-2">
          <Input
            aria-label={`Stock quantity for ${product.name}`}
            type="number"
            min="0"
            step="1"
            value={stockValues[product.id] ?? String(product.stock)}
            onChange={(event) =>
              setStockValues((current) => ({ ...current, [product.id]: event.target.value }))
            }
            className="max-w-28"
          />
          <Button
            size="sm"
            onClick={() => void saveStock(product)}
            isLoading={savingId === product.id}
            disabled={savingId !== null && savingId !== product.id}
          >
            Save
          </Button>
        </div>
      ),
    },
  ];

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 text-xs font-semibold text-emerald-400">
              <Boxes className="h-4 w-4" />
              Seller inventory
            </div>
            <h1 className="text-2xl font-black text-white">Inventory</h1>
            <p className="mt-1 text-sm text-slate-400">Stock levels for products returned by your seller account.</p>
          </div>
          <Button variant="outline" onClick={() => void loadInventory()} isLoading={loading} icon={<RefreshCw className="h-4 w-4" />}>
            Refresh
          </Button>
        </div>

        {error && (
          <div role="alert" className="rounded-xl border border-rose-500/30 bg-rose-950/40 px-4 py-3 text-sm text-rose-200">
            {error}
          </div>
        )}

        <Card padding="none">
          <Table
            columns={columns}
            data={products}
            keyExtractor={(product) => product.id}
            isLoading={loading}
            emptyText="No seller products are available."
          />
        </Card>
      </div>
    </AppShell>
  );
}
