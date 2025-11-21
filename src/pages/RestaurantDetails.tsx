import { useParams, useNavigate } from 'react-router-dom';
import { Star, Clock, MapPin, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MenuItem from '@/components/MenuItem';
import { mockRestaurants, mockMenuItems } from '@/utils/mockData';
import { addToCart } from '@/utils/cart';
import { MenuItem as MenuItemType, CartItem } from '@/types';
import { toast } from 'sonner';

const RestaurantDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const restaurant = mockRestaurants.find((r) => r.id === id);

  if (!restaurant) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Restaurant not found</h1>
        <Button onClick={() => navigate('/')}>Back to Home</Button>
      </div>
    );
  }

  const handleAddToCart = (item: MenuItemType) => {
    const cartItem: CartItem = {
      ...item,
      quantity: 1,
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
    };
    addToCart(cartItem);
    toast.success(`${item.name} added to cart!`);
    // Trigger storage event for navbar to update
    window.dispatchEvent(new Event('storage'));
  };

  const categories = Array.from(new Set(mockMenuItems.map((item) => item.category)));

  return (
    <div className="min-h-screen bg-background">
      {/* Back Button */}
      <div className="container mx-auto px-4 py-4">
        <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
      </div>

      {/* Restaurant Header */}
      <div className="relative h-80 overflow-hidden">
        <img
          src={restaurant.image}
          alt={restaurant.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="container mx-auto">
            <h1 className="text-4xl font-bold text-white mb-2">{restaurant.name}</h1>
            <p className="text-white/90 mb-4">{restaurant.cuisine}</p>
            <div className="flex flex-wrap items-center gap-4 text-white">
              <div className="flex items-center gap-1 bg-success px-3 py-1 rounded">
                <Star className="w-4 h-4 fill-current" />
                <span className="font-semibold">{restaurant.rating}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{restaurant.deliveryTime}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{restaurant.distance}</span>
              </div>
              <span>₹{restaurant.priceForTwo} for two</span>
            </div>
            {restaurant.offer && (
              <div className="mt-4 inline-block bg-accent text-accent-foreground px-4 py-2 rounded-lg font-semibold">
                {restaurant.offer}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Menu */}
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold mb-8">Menu</h2>

        {categories.map((category) => (
          <div key={category} className="mb-12">
            <h3 className="text-2xl font-semibold mb-6 pb-2 border-b">
              {category}
            </h3>
            <div className="space-y-4">
              {mockMenuItems
                .filter((item) => item.category === category)
                .map((item) => (
                  <MenuItem key={item.id} item={item} onAdd={handleAddToCart} />
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RestaurantDetails;
