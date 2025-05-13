<template>
    <v-container>
        <v-row>
            <v-col cols="12">
                <h1 class="text-h4 mb-4">Preferences</h1>
            </v-col>
        </v-row>

        <!-- Favorites Section -->
        <v-row>
            <v-col cols="12">
                <v-card>
                    <v-card-title class="text-h5">
                        <v-icon color="yellow darken-2" class="mr-2">mdi-star</v-icon>
                        Favorite Restaurants
                    </v-card-title>
                    <v-card-text>
                        <v-list v-if="favorites.length > 0">
                            <v-list-item v-for="restaurant in favorites" :key="restaurant.id">
                                <v-list-item-content>
                                    <v-list-item-title>{{ restaurant.name }}</v-list-item-title>
                                </v-list-item-content>
                                <v-list-item-action>
                                    <v-btn icon @click="removeFavorite(restaurant.id)">
                                        <v-icon color="error">mdi-delete</v-icon>
                                    </v-btn>
                                </v-list-item-action>
                            </v-list-item>
                        </v-list>
                        <v-alert v-else type="info" outlined>
                            No favorite restaurants yet. Add some from the menu!
                        </v-alert>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <!-- Ignored Section -->
        <v-row class="mt-4">
            <v-col cols="12">
                <v-card>
                    <v-card-title class="text-h5">
                        <v-icon color="red" class="mr-2">mdi-eye-off</v-icon>
                        Ignored Restaurants
                    </v-card-title>
                    <v-card-text>
                        <v-list v-if="ignored.length > 0">
                            <v-list-item v-for="restaurant in ignored" :key="restaurant.id">
                                <v-list-item-content>
                                    <v-list-item-title>{{ restaurant.name }}</v-list-item-title>
                                </v-list-item-content>
                                <v-list-item-action>
                                    <v-btn icon @click="removeIgnored(restaurant.id)">
                                        <v-icon color="error">mdi-delete</v-icon>
                                    </v-btn>
                                </v-list-item-action>
                            </v-list-item>
                        </v-list>
                        <v-alert v-else type="info" outlined>
                            No ignored restaurants yet.
                        </v-alert>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
import { preferencesStore } from '../plugins/preferences';

export default {
    name: 'Preferences',
    data() {
        return {
            favorites: [],
            ignored: []
        };
    },
    created() {
        this.updateLists();
    },
    methods: {
        updateLists() {
            this.favorites = preferencesStore.getFavorites();
            this.ignored = preferencesStore.getIgnored();
        },
        removeFavorite(restaurantId) {
            preferencesStore.removeFavorite(restaurantId);
            this.updateLists();
        },
        removeIgnored(restaurantId) {
            preferencesStore.removeIgnored(restaurantId);
            this.updateLists();
        }
    }
};
</script> 