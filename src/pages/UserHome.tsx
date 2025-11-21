import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Search, Leaf, Drumstick } from 'lucide-react';
import { categoriesAPI, foodItemsAPI } from '@/utils/apiService';
import FoodCard from '@/components/FoodCard';
import { MenuItem } from '@/types';
import { restaurantBrandAPI } from '@/utils/api';

const UserHome: React.FC = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [allItems, setAllItems] = useState<MenuItem[]>([]);
  const [filter, setFilter] = useState({ category: 'all', vegOnly: false, search: '' });
  const [loading, setLoading] = useState(true);
  const [visibleItems, setVisibleItems] = useState<MenuItem[]>([]);
  const [brand, setBrand] = useState<any>(null);

  useEffect(() => {
    fetchData();
    (async () => {
      try {
        const res = await restaurantBrandAPI.get();
        setBrand(res.data || null);
      } catch {}
    })();

    // Listen for live brand updates (e.g., isClosed toggled in admin)
    const onBrandUpdated = (e: any) => {
      const detail = e?.detail || {};
      setBrand((prev: any) => ({ ...(prev || {}), ...detail }));
    };
    window.addEventListener('brandUpdated', onBrandUpdated as any);

    // Generic admin changes: refetch categories/featured items quickly
    const onAdminChange = () => {
      fetchData();
    };
    window.addEventListener('adminDataChanged', onAdminChange as any);

    // Cross-tab sync via localStorage 'storage' event
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'brand_isClosed') {
        const value = e.newValue ? JSON.parse(e.newValue) : false;
        setBrand((prev: any) => ({ ...(prev || {}), isClosed: value }));
      } else if (e.key === 'admin_change') {
        fetchData();
      }
    };
    window.addEventListener('storage', onStorage);

    // Also pick up current value if it exists
    try {
      const existing = localStorage.getItem('brand_isClosed');
      if (existing != null) {
        const value = JSON.parse(existing);
        setBrand((prev: any) => ({ ...(prev || {}), isClosed: value }));
      }
    } catch {}

    return () => {
      window.removeEventListener('brandUpdated', onBrandUpdated as any);
      window.removeEventListener('adminDataChanged', onAdminChange as any);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  useEffect(() => {
    let items = [...allItems];
    if (filter.vegOnly) items = items.filter(x => x.isVeg);
    if (filter.category !== 'all') items = items.filter(x => x.category === filter.category);
    if (filter.search) items = items.filter(x =>
      x.name.toLowerCase().includes(filter.search.toLowerCase())
    );
    setVisibleItems(items);
  }, [allItems, filter]);

  const fetchData = async () => {
    setLoading(true);
    const [catRes, foodRes] = await Promise.all([
      categoriesAPI.getAll({ displayOnHomepage: true }),
      foodItemsAPI.getAll({ displayOnHomepage: true })
    ]);
    setCategories(catRes.data || []);
    setAllItems(foodRes.data || []);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Filters row (inside page, not a navbar) */}
      <div className="container mx-auto px-4 pt-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="hidden md:flex items-center gap-3">
            {brand?.logo && <img src={brand.logo} alt="logo" className="w-8 h-8 rounded" />}
            {brand?.name && <div className="font-bold text-xl">{brand.name}</div>}
            {brand?.openTime && brand?.closeTime && (
              <div className="text-sm text-gray-500">Open {brand.openTime} - {brand.closeTime}</div>
            )}
          </div>
          <div className="relative w-full md:max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search food..."
              value={filter.search}
              onChange={e => setFilter(f => ({ ...f, search: e.target.value }))}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button variant={filter.vegOnly ? 'default' : 'outline'} onClick={() => setFilter(f => ({ ...f, vegOnly: !f.vegOnly }))}>
              <Leaf className={filter.vegOnly ? 'text-green-600' : 'text-gray-400'} /> Veg Only
            </Button>
          </div>
        </div>
      </div>

      {/* CategoryBar */}
      <div className="flex px-4 py-4 gap-3 overflow-x-auto bg-card border-b mt-3">
        <Button
          variant={filter.category === 'all' ? 'default' : 'outline'}
          onClick={() => setFilter(f => ({ ...f, category: 'all' }))}
        >
          All
        </Button>
        {categories.map(cat => (
          <Button
            key={cat.id}
            variant={filter.category === cat.name ? 'default' : 'outline'}
            onClick={() => setFilter(f => ({ ...f, category: cat.name }))}
          >
            {cat.icon || <Drumstick className="w-4 h-4" />} {cat.name}
          </Button>
        ))}
      </div>

      {/* Food Grid */}
      <div className="container mx-auto px-4 py-6">
        {loading ? (
          <div className="flex justify-center py-20">
            <span>Loading...</span>
          </div>
        ) : visibleItems.length === 0 ? (
          <div className="text-center py-24 text-gray-400 font-bold text-xl">No food items found.</div>
        ) : (
          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${brand?.isClosed ? 'grayscale' : ''}`}>
            {visibleItems.map(item => (
              <FoodCard key={item.id} item={item} isClosed={!!brand?.isClosed} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserHome;
