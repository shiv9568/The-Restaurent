import { Link } from 'react-router-dom';
import { Star, Clock } from 'lucide-react';
import { Restaurant } from '@/types';
import { Card } from '@/components/ui/card';

interface RestaurantCardProps {
  restaurant: Restaurant;
}

const RestaurantCard = ({ restaurant }: RestaurantCardProps) => {
  return (
    <Link to={`/restaurant/${restaurant.id}`}>
      <Card className="overflow-hidden hover:shadow-card-hover transition-all duration-300 group cursor-pointer">
        {/* Image */}
        <div className="relative h-48 overflow-hidden">
          <img
            src={restaurant.image}
            alt={restaurant.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
          {restaurant.offer && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
              <span className="text-white text-sm font-semibold">
                {restaurant.offer}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-1 truncate">{restaurant.name}</h3>
          <p className="text-sm text-muted-foreground mb-2 truncate">
            {restaurant.cuisine}
          </p>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-1">
              <div className="flex items-center bg-success text-success-foreground px-2 py-0.5 rounded">
                <Star className="w-3 h-3 fill-current mr-1" />
                <span className="font-semibold">{restaurant.rating}</span>
              </div>
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground">{restaurant.deliveryTime}</span>
            </div>
          </div>

          <div className="flex items-center justify-between mt-2 text-sm">
            <span className="text-muted-foreground">
              ₹{restaurant.priceForTwo} for two
            </span>
            {restaurant.distance && (
              <span className="text-muted-foreground">{restaurant.distance}</span>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default RestaurantCard;
