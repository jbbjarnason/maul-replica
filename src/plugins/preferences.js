const STORAGE_KEY = 'maul-preferences';

export const preferencesStore = {
    getFavorites() {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const { favorites } = JSON.parse(stored);
            return favorites || [];
        }
        return [];
    },

    getIgnored() {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const { ignored } = JSON.parse(stored);
            return ignored || [];
        }
        return [];
    },

    save(favorites, ignored) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            favorites,
            ignored
        }));
    },

    addFavorite(restaurant) {
        const favorites = this.getFavorites();
        const ignored = this.getIgnored();
        
        if (!favorites.find(r => r.id === restaurant.RestaurantId)) {
            favorites.push({
                id: restaurant.RestaurantId,
                name: restaurant.RestaurantName
            });
            this.save(favorites, ignored);
        }
    },

    removeFavorite(restaurantId) {
        const favorites = this.getFavorites();
        const ignored = this.getIgnored();
        
        this.save(
            favorites.filter(r => r.id !== restaurantId),
            ignored
        );
    },

    addIgnored(restaurant) {
        const favorites = this.getFavorites();
        const ignored = this.getIgnored();
        
        if (!ignored.find(r => r.id === restaurant.RestaurantId)) {
            ignored.push({
                id: restaurant.RestaurantId,
                name: restaurant.RestaurantName
            });
            this.save(favorites, ignored);
        }
    },

    removeIgnored(restaurantId) {
        const favorites = this.getFavorites();
        const ignored = this.getIgnored();
        
        this.save(
            favorites,
            ignored.filter(r => r.id !== restaurantId)
        );
    },

    isFavorite(restaurantId) {
        return this.getFavorites().some(r => r.id === restaurantId);
    },

    isIgnored(restaurantId) {
        return this.getIgnored().some(r => r.id === restaurantId);
    }
}; 