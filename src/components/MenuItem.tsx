import { Plus, Star } from 'lucide-react';
import { MenuItem as MenuItemType } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface MenuItemProps {
  item: MenuItemType;
  onAdd: (item: MenuItemType) => void;
}

const MenuItem = ({ item, onAdd }: MenuItemProps) => {
  return (
    <Card className="p-4 hover:shadow-card-hover transition-shadow">
      <div className="flex gap-4">
        {/* Content */}
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div
                  className={`w-4 h-4 border-2 flex items-center justify-center ${
                    item.isVeg ? 'border-success' : 'border-destructive'
                  }`}
                >
                  <div
                    className={`w-2 h-2 rounded-full ${
                      item.isVeg ? 'bg-success' : 'bg-destructive'
                    }`}
                  />
                </div>
                <h3 className="font-semibold">{item.name}</h3>
              </div>
              {item.rating && (
                <div className="flex items-center text-sm text-muted-foreground mb-1">
                  <Star className="w-3 h-3 fill-success text-success mr-1" />
                  <span>{item.rating}</span>
                </div>
              )}
            </div>
          </div>

          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
            {item.description}
          </p>

          <div className="flex items-center justify-between">
            <span className="font-semibold text-lg">₹{item.price}</span>
            <Button
              size="sm"
              onClick={() => onAdd(item)}
              className="gap-1"
            >
              <Plus className="w-4 h-4" />
              Add
            </Button>
          </div>
        </div>

        {/* Image */}
        {item.image && (
          <div className="w-24 h-24 flex-shrink-0">
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
        )}
      </div>
    </Card>
  );
};

export default MenuItem;
