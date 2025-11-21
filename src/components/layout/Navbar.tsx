import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Search, MapPin, LogOut } from 'lucide-react';
import { useUser, useClerk } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import profile from '@/assets/profile.png'; // ✅ FIXED: correct import syntax
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getCartItemsCount } from '@/utils/cart';
import { useState, useEffect } from 'react';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, isSignedIn } = useUser();
  const { signOut } = useClerk();
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    updateCartCount();
    window.addEventListener('storage', updateCartCount);
    // Also listen for custom cart update events
    window.addEventListener('cartUpdated', updateCartCount);
    return () => {
      window.removeEventListener('storage', updateCartCount);
      window.removeEventListener('cartUpdated', updateCartCount);
    };
  }, []);

  const updateCartCount = () => {
    setCartCount(getCartItemsCount());
  };

  const handleLogout = () => {
    signOut();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 bg-background border-b shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img
              src="/logo.jpg"
              alt="D&G Restaurent"
              className="w-10 h-10 rounded-lg object-cover"
            />
            <span className="text-xl font-bold text-foreground">D&G Restaurent</span>
          </Link>

          {/* Location */}
          <div className="hidden md:flex items-center space-x-2 text-sm">
            <MapPin className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground">Deliver to:</span>
            <button className="font-semibold text-foreground hover:text-primary transition-colors">
              Muzaffarnagar UP west, 251201
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => navigate('/cart')}
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Button>

            {isSignedIn ? (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full bg-pink-600">
                      <img
                        src={profile} // ✅ FIXED fallback logic
                        // alt={user?.fullName || 'User'}
                        className="h-8 w-8 rounded-full object-cover border border-green-200"
                      />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex items-center gap-3 p-3">
                      <img
                        src={user?.imageUrl || profile}
                        alt={user?.fullName || 'User'}
                        className="h-10 w-10 rounded-full object-cover border border-gray-200"
                      />
                      <div className="flex flex-col space-y-1">
                        <p className="font-medium truncate">
                          {user?.fullName || user?.firstName || 'User'}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">
                          {user?.primaryEmailAddress?.emailAddress || 'user@example.com'}
                        </p>
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-xs text-green-600 font-medium">Online</span>
                        </div>
                      </div>
                    </div>

                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/profile')}>
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={handleLogout}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button variant="outline" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <Button onClick={() => navigate('/auth')}>
                Login
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
