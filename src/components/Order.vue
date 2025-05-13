<template>
    <v-container fluid>
        <v-dialog v-model="dialog" max-width="290">
            <v-card>
                <v-card-title class="text-h5">
                    Order successful
                </v-card-title>
                <v-card-actions>
                    <v-spacer></v-spacer>

                    <v-btn color="green darken-1" text @click="dialog = false">
                        Close
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <v-layout>
            <v-container>
                <h1>Menu for week {{ selectedWeek }}</h1>
                <v-row align="center">
                    <v-col align="center">
                        <h3>{{ GetDateRangeOfWeek(selectedWeek) }}</h3>
                    </v-col>
                </v-row>

                <v-row v-if="errorMessage" align="center">
                    <v-col align="center">
                        <v-alert type="error">{{ errorMessage }}</v-alert>
                    </v-col>
                </v-row>

                <!-- Favorites Section -->
                <v-row v-if="hasFavoriteItems" class="mt-4">
                    <v-col>
                        <v-row>
                            <h2>Favorite Restaurants</h2>
                        </v-row>
                        <v-row>
                            <v-col cols="12">
                                <div class="pa-2">
                                    <div class="d-flex flex-wrap">
                                        <div 
                                            v-for="dish in favoriteItems" 
                                            :key="dish.MenuItemId"
                                            class="flex-grow-1 mb-4 mr-4"
                                            style="min-width: calc(50% - 16px); max-width: calc(50% - 16px);"
                                        >
                                            <menu-card
                                                :dish="dish"
                                                :lang="lang"
                                                width="100%"
                                                size="small"
                                                :day="dish.day"
                                                :color="CardColor(dish.WeekdayNumber, dish.MenuItemId)"
                                                @click="SelectItem(dish.WeekdayNumber, dish)"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </v-col>
                        </v-row>
                    </v-col>
                </v-row>

                <v-row v-for="dayIndex in 5" :key="`dayMenu-${dayIndex}`">
                    <v-col>
                        <v-row v-if="dayIndex > 0 && GetMenuForWeekday(dayIndex).length > 0">
                            <h1>{{ Weekday(dayIndex) }}</h1>
                        </v-row>
                        <v-row v-if="renderComponent">
                            <menu-card
                                v-for="dish in GetMenuForWeekday(dayIndex)"
                                :key="dish.MenuItemId"
                                :dish="dish"
                                :lang="lang"
                                :color="CardColor(dayIndex, dish.MenuItemId)"
                                width="30%"
                                @click="SelectItem(dayIndex, dish)"
                            />
                        </v-row>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <v-btn 
                            @click="Submit()" 
                            :disabled="Object.keys(selectedItems).length === 0"
                        >Submit order</v-btn>
                    </v-col>
                </v-row>
            </v-container>
        </v-layout>
    </v-container>
</template>

<script>
import $ from 'jquery'
import MenuCard from './MenuCard.vue'
import { preferencesStore } from '../plugins/preferences'

export default {
    name: 'Order',
    components: {
        MenuCard
    },
    inject: ['user'],
    data() {
        return {
            menu: [],
            selectedWeek: 0,
            selectedYear: 0,
            selectedItems: {},
            renderComponent: true,
            dialog: false,
            lang: 'is',
            errorMessage: '',
            userData: null,
            existingOrders: [],
        }
    },
    computed: {
        favoriteItems() {
            const favorites = preferencesStore.getFavorites();
            const favoriteOrders = this.menu.filter(dish => 
                favorites.some(fav => fav.id === dish.RestaurantId)
            );
            
            // Add day information to each order
            return favoriteOrders.map(dish => ({
                ...dish,
                day: this.Weekday(dish.WeekdayNumber)
            }));
        },
        hasFavoriteItems() {
            return this.favoriteItems.length > 0;
        }
    },
    mounted() {
        this.selectedWeek = this.GetAvailableWeekNumber();
        this.selectedYear = new Date().getFullYear();
        this.userData = { ...this.user };
        this.Update();
    },
    methods: {
        Weekday(WeekdayNumber) {
            if (WeekdayNumber == 1) {
                return "Monday";
            } else if (WeekdayNumber == 2) {
                return "Tuesday";
            } else if (WeekdayNumber == 3) {
                return "Wednesday";
            } else if (WeekdayNumber == 4) {
                return "Thursday";
            } else if (WeekdayNumber == 5) {
                return "Friday";
            } else if (WeekdayNumber == 6) {
                return "Saturday";
            } else if (WeekdayNumber == 7) {
                return "Sunday";
            }
            return "Unknown";
        },
        GetAvailableWeekNumber() {
            const currentDate = new Date();
            const startDate = new Date(currentDate.getFullYear(), 0, 1);
            const daysBeforeMenuIsAvailable = 4; // Menu available on Thursdays
            const days = Math.floor((currentDate - startDate) /
                (24 * 60 * 60 * 1000)) + daysBeforeMenuIsAvailable;

            // Plus one for next week
            return Math.ceil(days / 7) + 1;
        },
        GetDateRangeOfWeek(weekNo) {
            Date.prototype.getWeek = function () {
                var target = new Date(this.valueOf());
                var dayNr = (this.getDay() + 6) % 7;
                target.setDate(target.getDate() - dayNr + 3);
                var firstThursday = target.valueOf();
                target.setMonth(0, 1);
                if (target.getDay() != 4) {
                    target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
                }
                return 1 + Math.ceil((firstThursday - target) / 604800000);
            }

            var d1 = new Date();
            let numOfdaysPastSinceLastMonday = eval(d1.getDay() - 1);
            d1.setDate(d1.getDate() - numOfdaysPastSinceLastMonday);
            var weekNoToday = d1.getWeek();
            var weeksInTheFuture = eval(weekNo - weekNoToday);
            d1.setDate(d1.getDate() + eval(7 * weeksInTheFuture));
            var rangeIsFrom = d1.getDate() + "/" + eval(d1.getMonth() + 1) + "/" + d1.getFullYear();
            d1.setDate(d1.getDate() + 6);
            var rangeIsTo = d1.getDate() + "/" + eval(d1.getMonth() + 1) + "/" + d1.getFullYear();
            return rangeIsFrom + " to " + rangeIsTo;
        },
        GetMenuForWeekday(weekdayNumber) {
            return this.menu.filter(m => m.WeekdayNumber == weekdayNumber)
        },
        async Update() {
            var self = this;
            this.selectedItems = {};
            this.errorMessage = '';

            // Get user info from localStorage if needed
            const userInfo = localStorage.getItem('user_info');
            if (userInfo) {
                this.userData = JSON.parse(userInfo);
            }

            if (!this.userData || !this.userData.token || !this.userData.location) {
                console.error('User information is missing');
                this.$router.replace({ name: 'login' });
                return;
            }

            $.ajax({
                beforeSend: function (request) {
                    request.setRequestHeader("authorization", "Bearer " + self.userData.token);
                },
                dataType: "json",
                url: "https://dev-api.maul.is/location/" + self.userData.location + "/menus/" + self.selectedYear + "-W" + (self.selectedWeek < 10 ? `0${self.selectedWeek}` : self.selectedWeek),
                success: function (obj) {
                    if (obj && Array.isArray(obj) && obj.length > 0) {
                        self.menu = obj[0].Menu;
                        if (!self.menu || self.menu.length === 0) {
                            self.errorMessage = `No menu found for: Year ${self.selectedYear}, Week ${self.selectedWeek}, Location ${self.userData.location}`;
                        } else {
                            // Check if there is an existing order
                            self.FetchExistingOrders();
                        }
                    } else {
                        self.menu = [];
                        self.errorMessage = `No menu found for: Year ${self.selectedYear}, Week ${self.selectedWeek}, Location ${self.userData.location}`;
                    }
                },
                error: function(err) {
                    console.error('Failed to fetch menu:', err);
                    self.menu = [];
                    self.errorMessage = 'Something went wrong, could not fetch menu.';
                }
            });
        },
        FetchExistingOrders() {
            var self = this;
            $.ajax({
                beforeSend: function (request) {
                    request.setRequestHeader("authorization", "Bearer " + self.userData.token);
                },
                dataType: "json",
                url: `https://dev-api.maul.is/users/${self.userData.uuid}/orders/${self.selectedYear}-W${(self.selectedWeek < 10 ? `0${self.selectedWeek}` : self.selectedWeek)}/v2`,
                success: function (obj) {
                    if (obj && Array.isArray(Object.keys(obj))) {
                        const orderArray = Object.keys(obj).map((key) => obj[key]);
                        if (orderArray.length > 0) {
                            // Populate selectedItems with existing order menu items
                            orderArray.forEach(order => {
                                self.selectedItems[order.WeekdayNumber] = order;
                            });
                            self.ForceRerender();
                        }
                    }
                },
                error: function(err) {
                    console.error('Failed to fetch existing orders:', err);
                }
            });
        },
        SelectItem(dayIndex, dish) {
            this.selectedItems[dayIndex] = dish;
            this.ForceRerender();
        },
        CardColor(dayIndex, dishId) {
            if (this.selectedItems[dayIndex]) {
                if (this.selectedItems[dayIndex].MenuItemId === dishId) {
                    return "green";
                }
            }
            return undefined;
        },
        ForceRerender() {
            // Removing my-component from the DOM
            this.renderComponent = false;

            this.$nextTick(() => {
                // Adding the component back in
                this.renderComponent = true;
            });
        },
        Submit() {
            let data = {
                UserId: this.userData.uuid,
                Email: this.userData.email,
                IsoWeek: this.selectedYear + "-W" + (this.selectedWeek < 10 ? `0${this.selectedWeek}` : this.selectedWeek),
                MealTime: "Lunch", // todo
                FspId: "maul",
                MenuId: "variety-a",
                Order: {}
            };
            for (const dayIndex in this.selectedItems) {
                let dish = this.selectedItems[dayIndex];
                if (dish) {
                    const WeekdayNumber = Number(dayIndex);
                    const CandidateMenuItemIds = this.menu.filter(x => x.WeekdayNumber === WeekdayNumber).map(x => x.MenuItemId);
                    data.Order[WeekdayNumber] = {
                        Allergens: dish.Allergens,
                        AllergensProvided: dish.AllergensProvided,
                        CandidateMenuItemIds,
                        DescriptionByLang: dish.DescriptionByLang,
                        DietTypes: dish.DietTypes,
                        ImageId: dish.ImageId,
                        MenuItemId: dish.MenuItemId,
                        RestaurantId: dish.RestaurantId,
                        RestaurantName: dish.RestaurantName,
                        ShortDescriptionByLang: dish.ShortDescriptionByLang,
                        Temperature: dish.Temperature,
                        WeekdayNumber: String(WeekdayNumber),
                    }
                }
            }
            var self = this;
            $.ajax({
                beforeSend: (request) => {
                    request.setRequestHeader("authorization", "Bearer " + self.userData.token);
                },
                type: "POST",
                dataType: "json",
                url: "https://dev-api.maul.is/orders",
                data: JSON.stringify(data),
                success: (response) => {
                    console.log("Success", response);
                    self.dialog = true;
                },
                error: function (err) {
                    console.log(err);
                }
            });
        },
    }
}
</script>

<style scoped>
.v-card {
    display: flex;
    flex-direction: column;
}

.v-card__text {
    flex-grow: 1;
}

.v-card__actions {
    margin-top: auto;
    padding-bottom: 16px;
}
</style>
