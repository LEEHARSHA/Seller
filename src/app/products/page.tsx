'use client';

import React, { useEffect, useState, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AppShell } from '../../components/layout/AppShell';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Tabs } from '../../components/ui/Tabs';
import { Badge } from '../../components/ui/Badge';
import { Table, Column } from '../../components/ui/Table';
import { Pagination } from '../../components/ui/Pagination';
import { EmptyState } from '../../components/ui/EmptyState';
import { Product } from '../../types';
import { getSellerProductsApi } from '../../lib/api/products';
import { Plus, Search, Eye, Edit, Package } from 'lucide-react';

function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialSearch = searchParams ? searchParams.get('search') || '' : '';

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('updated');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      try {
        const data = await getSellerProductsApi('all');
        setProducts(data);
      } catch (err) {
        console.warn('Error loading products:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  const counts = useMemo(() => {
    return {
      all: products.length,
      pending: products.filter((p) => p.status === 'pending').length,
      approved: products.filter((p) => p.status === 'approved').length,
      rejected: products.filter((p) => p.status === 'rejected').length,
    };
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (activeTab !== 'all' && p.status !== activeTab) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const nameMatch = p.name.toLowerCase().includes(q);
        const skuMatch = p.sku.toLowerCase().includes(q);
        const catMatch = p.category.toLowerCase().includes(q);
        const brandMatch = p.brand.toLowerCase().includes(q);
        return nameMatch || skuMatch || catMatch || brandMatch;
      }
      return true;
    });
  }, [products, activeTab, searchQuery]);

  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'stock') return b.stock - a.stock;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }, [filteredProducts, sortBy]);

  const totalPages = Math.ceil(sortedProducts.length / pageSize);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedProducts.slice(start, start + pageSize);
  }, [sortedProducts, currentPage, pageSize]);

  const tabs = [
    { id: 'all', label: 'All Products', count: counts.all },
    { id: 'pending', label: 'Pending Review', count: counts.pending },
    { id: 'approved', label: 'Approved Live', count: counts.approved },
    { id: 'rejected', label: 'Rejected', count: counts.rejected },
  ];

  const columns: Column<Product>[] = [
    {
      header: 'Product Details',
      cell: (p) => (
        <div className="flex items-center space-x-3 max-w-xs">
          <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700/80 overflow-hidden shrink-0">
            {typeof p.images[0] === 'string' ? (
              <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
            ) : (
              <Package className="w-6 h-6 text-slate-500 m-auto mt-3" />
            )}
          </div>
          <div className="truncate">
            <p className="font-bold text-white text-xs truncate">{p.name}</p>
            <p className="text-[10px] text-slate-400 font-mono">SKU: {p.sku}</p>
            <p className="text-[10px] text-slate-500">{p.brand}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Category',
      accessorKey: 'category',
      cell: (p) => (
        <div>
          <p className="text-xs font-semibold text-slate-200">{p.category}</p>
          <p className="text-[10px] text-slate-400">{p.subCategory}</p>
        </div>
      ),
    },
    {
      header: 'Pricing',
      cell: (p) => (
        <div>
          <p className="font-bold text-emerald-400 text-xs">₹{p.price.toLocaleString('en-IN')}</p>
          {p.compareAtPrice && (
            <p className="text-[10px] text-slate-500 line-through">₹{p.compareAtPrice.toLocaleString('en-IN')}</p>
          )}
        </div>
      ),
    },
    {
      header: 'Stock Status',
      cell: (p) => (
        <div>
          <p
            className={`text-xs font-semibold ${
              p.stock === 0
                ? 'text-rose-400'
                : p.stock < (p.lowStockThreshold || 10)
                ? 'text-amber-400'
                : 'text-slate-300'
            }`}
          >
            {p.stock} units
          </p>
          {p.stock < (p.lowStockThreshold || 10) && (
            <p className="text-[9px] text-amber-400 font-medium">Low Stock</p>
          )}
        </div>
      ),
    },
    {
      header: 'Approval Status',
      cell: (p) => <Badge status={p.status} size="sm" />,
    },
    {
      header: 'Actions',
      cell: (p) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/products/${p.id}`);
            }}
            icon={<Eye className="w-3.5 h-3.5" />}
          >
            View
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/products/${p.id}/edit`);
            }}
            icon={<Edit className="w-3.5 h-3.5" />}
          >
            Edit
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Product Catalog</h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage store products, monitor review statuses, and update inventory details.
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => router.push('/products/new')}
          icon={<Plus className="w-4 h-4" />}
        >
          Add New Product
        </Button>
      </div>

      {/* Filter Controls Bar */}
      <Card variant="default" padding="sm" className="space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <Tabs tabs={tabs} activeTab={activeTab} onChange={(id) => { setActiveTab(id); setCurrentPage(1); }} />

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
            <div className="w-full sm:w-64">
              <Input
                placeholder="Search by name, SKU, brand..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                icon={<Search className="w-4 h-4" />}
              />
            </div>

            <div className="w-full sm:w-48">
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                options={[
                  { label: 'Recently Updated', value: 'updated' },
                  { label: 'Name (A to Z)', value: 'name' },
                  { label: 'Price: Low to High', value: 'price-low' },
                  { label: 'Price: High to Low', value: 'price-high' },
                  { label: 'Highest Stock', value: 'stock' },
                ]}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Products Table or Empty State */}
      {sortedProducts.length === 0 ? (
        <EmptyState
          icon={<Package className="w-8 h-8 text-slate-400" />}
          title={searchQuery ? 'No matching products found' : 'No products in this view'}
          description={
            searchQuery
              ? `No products match "${searchQuery}". Try clearing search filters.`
              : 'Start by listing your fitness products for review and publication.'
          }
          actionLabel="Add Product"
          onAction={() => router.push('/products/new')}
          actionIcon={<Plus className="w-4 h-4" />}
        />
      ) : (
        <div className="space-y-4">
          {/* Desktop View */}
          <div className="hidden md:block">
            <Table
              columns={columns}
              data={paginatedProducts}
              keyExtractor={(p) => p.id}
              isLoading={loading}
              onRowClick={(p) => router.push(`/products/${p.id}`)}
            />
          </div>

          {/* Mobile View */}
          <div className="md:hidden space-y-3">
            {paginatedProducts.map((p) => (
              <Card
                key={p.id}
                variant="interactive"
                padding="md"
                onClick={() => router.push(`/products/${p.id}`)}
                className="space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 overflow-hidden shrink-0">
                      {typeof p.images[0] === 'string' ? (
                        <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                      ) : (
                        <Package className="w-6 h-6 text-slate-500 m-auto mt-3" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white line-clamp-1">{p.name}</h4>
                      <p className="text-[10px] text-slate-400 font-mono">SKU: {p.sku}</p>
                      <p className="text-[10px] text-slate-400">{p.category}</p>
                    </div>
                  </div>
                  <Badge status={p.status} size="sm" />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block">Price</span>
                    <span className="font-bold text-emerald-400">₹{p.price.toLocaleString('en-IN')}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block">Stock</span>
                    <span className="font-semibold text-slate-200">{p.stock} units</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/products/${p.id}/edit`);
                      }}
                    >
                      Edit
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(pg) => setCurrentPage(pg)}
            totalItems={sortedProducts.length}
            pageSize={pageSize}
          />
        </div>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <AppShell>
      <Suspense fallback={<div className="p-8 text-center text-slate-400 text-xs">Loading Catalog...</div>}>
        <ProductsContent />
      </Suspense>
    </AppShell>
  );
}
