import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import RestaurantCard from '@/components/RestaurantCard';
import FoodCard from '@/components/FoodCard';
import heroImage from '@/assets/hero-food.jpg';
import { MenuItem } from '@/types';
import { categoriesAPI, foodItemsAPI, restaurantsAPI } from '@/utils/apiService';
import { Loader2 } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  displayOnHomepage: boolean;
  items: MenuItem[];
}

const Home = () => {
  const [featuredFoodItems, setFeaturedFoodItems] = useState<MenuItem[]>([]);
  const [menuCategories, setMenuCategories] = useState<Category[]>([]);
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [defaultRestaurant, setDefaultRestaurant] = useState({ id: 'main-restaurant', name: 'D&G Restaurent' });

  useEffect(() => {
    loadData();
    // Refresh data every 30 seconds
    const interval = setInterval(loadData, 30000);
    // Listen for admin changes (same-tab and cross-tab)
    const onAdminChange = () => loadData();
    const onStorage = (e: StorageEvent) => { if (e.key === 'admin_change') loadData(); };
    window.addEventListener('adminDataChanged', onAdminChange as any);
    window.addEventListener('storage', onStorage);
    return () => {
      clearInterval(interval);
      window.removeEventListener('adminDataChanged', onAdminChange as any);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Load categories with homepage visibility
      const categoriesResponse = await categoriesAPI.getAll({ displayOnHomepage: true });
      const allCategories = categoriesResponse.data || [];
      
      // Load featured food items
      const featuredResponse = await foodItemsAPI.getAll({ 
        displayOnHomepage: true
      });
      
      // Load restaurants
      try {
        const restaurantsResponse = await restaurantsAPI.getAll({ isActive: true });
        const restaurantsData = restaurantsResponse.data || [];
        setRestaurants(restaurantsData);
        
        // Use first restaurant as default if available
        if (restaurantsData.length > 0) {
          setDefaultRestaurant({
            id: restaurantsData[0].id || 'main-restaurant',
            name: restaurantsData[0].name || 'D&G Restaurent'
          });
        }
      } catch (error) {
        console.error('Error loading restaurants:', error);
        setRestaurants([]);
      }

      // Set categories
      setMenuCategories(allCategories);
      
      // Set featured items
      const featuredItems = featuredResponse.data?.map((item: any) => ({
        ...item,
        category: item.category || 'Food',
      })) || [];
      setFeaturedFoodItems(featuredItems);
    } catch (error: any) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[500px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/40 z-10" />
        <img
          src={heroImage}
          alt="Delicious food"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="relative z-20 text-center px-4 max-w-3xl">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            Order Your Favorite Food
          </h1>
          <p className="text-xl text-white/90 mb-8">
            Delicious meals delivered fast to your doorstep
          </p>
          <div className="flex gap-2 max-w-xl mx-auto bg-white rounded-lg p-2 shadow-lg">
            <Input
              type="text"
              placeholder="Search for restaurants or dishes..."
              className="border-0 focus-visible:ring-0"
            />
            <Button size="lg" className="px-8">
              <Search className="w-5 h-5 mr-2" />
              Search
            </Button>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Menu Categories with Items */}
        {menuCategories.length > 0 && (
          <>
            {menuCategories.map((category) => {
              const availableItems = category.items?.filter((item: any) => item.isAvailable !== false) || [];
              if (availableItems.length === 0) return null;
              
              return (
                <section key={category.id} className="mb-12">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{category.icon || '🍽️'}</span>
                      <div>
                        <h2 className="text-2xl font-bold">{category.name}</h2>
                        {category.description && (
                          <p className="text-sm text-gray-500">{category.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {availableItems.length} items
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {availableItems.map((item: any) => (
                      <FoodCard 
                        key={item.id} 
                        item={item as MenuItem}
                        restaurantId={defaultRestaurant.id}
                        restaurantName={defaultRestaurant.name}
                      />
                    ))}
                  </div>
                </section>
              );
            })}
          </>
        )}

        {/* Featured Food Items */}
        {featuredFoodItems.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Featured Food Items</h2>
              <div className="text-sm text-gray-500">
                {featuredFoodItems.length} items available
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {featuredFoodItems.map((item) => (
                <FoodCard 
                  key={item.id} 
                  item={item}
                  restaurantId={defaultRestaurant.id}
                  restaurantName={defaultRestaurant.name}
                />
              ))}
            </div>
          </section>
        )}

        {/* Show message if no items */}
        {menuCategories.length === 0 && featuredFoodItems.length === 0 && (
          <section className="mb-12">
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <h2 className="text-2xl font-bold text-gray-600 mb-2">No Menu Items</h2>
              <p className="text-gray-500 mb-4">
                No menu items are currently available on the homepage.
              </p>
              <p className="text-sm text-gray-400">
                Admin can add items to categories and enable "Show on Homepage" to display them here.
              </p>
            </div>
          </section>
        )}

        {/* Top Offers */}
        {restaurants.filter((r: any) => r.offer).length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Top Offers For You</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {restaurants
                .filter((r: any) => r.offer)
                .map((restaurant: any) => (
                  <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                ))}
            </div>
          </section>
        )}

        {/* All Restaurants */}
        {restaurants.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-6">Restaurants Near You</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {restaurants.map((restaurant: any) => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default Home;
