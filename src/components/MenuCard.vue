<template>
    <v-card
        :color="color"
        class="menu-card d-flex flex-column"
        :style="{ width: width }"
        @click="$emit('click')"
    >
        <v-card-title class="text-h6">{{ dish.ShortDescriptionByLang[lang] }}</v-card-title>
        <v-card-subtitle>
            <b>{{ dish.RestaurantName }}</b>
            <v-icon
                v-if="isFavorite"
                small
                color="yellow darken-2"
                class="ml-2"
            >mdi-star</v-icon>
        </v-card-subtitle>
        
        <v-card-text v-if="size === 'normal'" class="flex-grow-1">
            <v-row>
                <v-col>{{ dish.DescriptionByLang[lang] }}</v-col>
            </v-row>
            <v-row v-if="dish.Allergens.length > 0">
                <v-col>
                    <v-chip
                        v-for="allergen in dish.Allergens"
                        :key="allergen"
                        color="grey lighten-4"
                        class="mr-2 mb-2"
                        small
                        outlined
                    >
                        <v-icon left small color="grey">mdi-alert-circle</v-icon>
                        <span class="grey--text">{{ allergen }}</span>
                    </v-chip>
                </v-col>
            </v-row>
        </v-card-text>

        <v-card-actions v-if="size === 'normal'" class="pt-0">
            <v-row v-if="dish.DietTypes.length > 0" justify="center">
                <v-chip
                    v-for="diet in dish.DietTypes"
                    :key="diet"
                    :color="dietTypeColors[diet] || '#F0F0F0'"
                    class="mr-2 mb-2"
                    small
                >
                    {{ diet.charAt(0).toUpperCase() + diet.slice(1) }}
                </v-chip>
            </v-row>
            <v-menu offset-y v-model="menuOpen">
                <template v-slot:activator="{ on, attrs }">
                    <v-btn
                        icon
                        v-bind="attrs"
                        v-on="on"
                        @click.stop
                    >
                        <v-icon>mdi-dots-vertical</v-icon>
                    </v-btn>
                </template>
                <v-list>
                    <v-list-item @click.stop="toggleFavorite">
                        <v-list-item-icon>
                            <v-icon :color="isFavorite ? 'yellow darken-2' : ''">
                                {{ isFavorite ? 'mdi-star' : 'mdi-star-outline' }}
                            </v-icon>
                        </v-list-item-icon>
                        <v-list-item-content>
                            <v-list-item-title>{{ isFavorite ? 'Remove from Favorites' : 'Add to Favorites' }}</v-list-item-title>
                        </v-list-item-content>
                    </v-list-item>
                    <v-list-item @click.stop="toggleIgnored">
                        <v-list-item-icon>
                            <v-icon :color="isIgnored ? 'red' : ''">
                                {{ isIgnored ? 'mdi-eye-off' : 'mdi-eye' }}
                            </v-icon>
                        </v-list-item-icon>
                        <v-list-item-content>
                            <v-list-item-title>{{ isIgnored ? 'Show this restaurant on menu' : 'Don\'t show this restaurant' }}</v-list-item-title>
                        </v-list-item-content>
                    </v-list-item>
                </v-list>
            </v-menu>
        </v-card-actions>

        <div v-if="day" class="day-indicator">
            <v-chip
                small
                outlined
                color="primary"
                class="ma-2"
            >
                {{ day }}
            </v-chip>
        </div>
    </v-card>
</template>

<script>
import { preferencesStore } from '../plugins/preferences';

export default {
    name: 'MenuCard',
    props: {
        dish: {
            type: Object,
            required: true
        },
        lang: {
            type: String,
            default: 'is'
        },
        color: {
            type: String,
            default: undefined
        },
        width: {
            type: String,
            default: '30%'
        },
        size: {
            type: String,
            default: 'normal',
            validator: value => ['small', 'normal'].includes(value)
        },
        day: {
            type: String,
            default: null
        }
    },
    data() {
        return {
            dietTypeColors: {
                'omnivore': '#FFE4E1',
                'vegan': '#E0F4E0',
                'pescatarian': '#E6F3FF',
                'low-carb': '#FFF0DB'
            },
            menuOpen: false
        }
    },
    computed: {
        isFavorite() {
            return preferencesStore.isFavorite(this.dish.RestaurantId);
        },
        isIgnored() {
            return preferencesStore.isIgnored(this.dish.RestaurantId);
        }
    },
    methods: {
        toggleFavorite() {
            if (this.isFavorite) {
                preferencesStore.removeFavorite(this.dish.RestaurantId);
            } else {
                preferencesStore.addFavorite(this.dish);
            }
            this.menuOpen = false;
        },
        toggleIgnored() {
            if (this.isIgnored) {
                preferencesStore.removeIgnored(this.dish.RestaurantId);
            } else {
                preferencesStore.addIgnored(this.dish);
            }
            this.menuOpen = false;
        }
    }
}
</script>

<style scoped>
.menu-card {
    display: flex;
    flex-direction: column;
    transition: transform 0.2s ease-in-out;
    position: relative;
}

.menu-card:hover {
    transform: translateY(-2px);
}

.v-card__text {
    flex-grow: 1;
}

.v-card__actions {
    margin-top: auto;
    padding-bottom: 16px;
}

.day-indicator {
    position: absolute;
    bottom: 8px;
    right: 8px;
    z-index: 1;
}

.v-card__title,
.v-card__subtitle {
    word-break: normal;
    word-wrap: break-word;
    white-space: normal;
}

@media (max-width: 600px) {
    .menu-card {
        margin: 4px !important;
    }
    
    .v-card__title {
        font-size: 1.1rem !important;
        padding: 12px !important;
    }
    
    .v-card__subtitle {
        padding: 0 12px 12px !important;
    }
    
    .v-card__text {
        padding: 12px !important;
    }
}
</style>
