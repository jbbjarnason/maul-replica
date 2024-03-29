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
                    <v-col align="right">
                        <v-btn @click="OffsetWeek(-1)">Previous week</v-btn>
                    </v-col>
                    <v-col align="center">
                        <h3>{{ GetDateRangeOfWeek(selectedWeek) }}</h3>
                    </v-col>
                    <v-col align="left">
                        <v-btn @click="OffsetWeek(1)">Next week</v-btn>
                    </v-col>
                </v-row>

                <v-row v-for="dayIndex in 5" :key="`dayMenu-${dayIndex}`">
                    <v-col>
                        <v-row v-if="dayIndex > 0">
                            <h1>{{ Weekday(dayIndex) }}</h1>
                        </v-row>
                        <v-row v-for="dish in GetMenuForWeekday(dayIndex)" :key="`${dish.MenuItemId}`">
                            <v-col>
                                <v-card v-if="renderComponent" @click="SelectItem(dayIndex, dish)"
                                    :color="CardColor(dayIndex, dish.MenuItemId)">
                                    <v-card-title><b>{{ dish.Diet }}:</b>&nbsp;{{ dish.ShortDescription[user.english ? 'en' : 'is'] }}</v-card-title>
                                    <v-card-subtitle><b>{{ dish.RestaurantName }}</b></v-card-subtitle>
                                    <v-card-text>
                                        <v-row>
                                            <v-col>{{ dish.Description[user.english ? 'en' : 'is'] }}</v-col>
                                        </v-row>
                                        <v-row v-if="dish.Allergens.length > 0">
                                            <v-col>Allergies: {{ dish.Allergens.toString() }}</v-col>
                                        </v-row>
                                    </v-card-text>
                                </v-card>
                            </v-col>
                        </v-row>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <v-btn @click="Submit()">Submit order</v-btn>
                    </v-col>
                </v-row>
            </v-container>
        </v-layout>
    </v-container>
</template>

<script>
import $ from 'jquery'
export default {
    name: 'Order',
    inject: ['user'],
    data() {
        return {
            menu: [],
            selectedWeek: 0,
            selectedYear: 0,
            selectedItems: {},
            renderComponent: true,
            dialog: false,
        }
    },
    mounted() {
        this.selectedWeek = this.CurrentWeekNumber();
        this.selectedYear = new Date().getFullYear();
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
        CurrentWeekNumber() {
            const currentDate = new Date();
            const startDate = new Date(currentDate.getFullYear(), 0, 1);
            const daysBeforeMenuIsAvailable = 4; // Menu for a week is available on Thursdays
            const days = Math.floor((currentDate - startDate) /
                (24 * 60 * 60 * 1000)) + daysBeforeMenuIsAvailable;

            return Math.ceil(days / 7);
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
        OffsetWeek(offset) {
            this.selectedWeek += offset;
            if (this.selectedWeek > 52) {
                this.selectedYear += 1;
                this.selectedWeek = 1;
            }
            if (this.selectedWeek < 1) {
                this.selectedYear -= 1;
                this.selectedWeek = 52;
            }
            this.Update();
        },
        GetMenuForWeekday(weekdayNumber) {
            return this.menu.filter(m => m.WeekdayNumber == weekdayNumber)
        },
        Update() {
            var self = this;
            this.selectedItems = {};
            $.ajax({
                beforeSend: function (request) {
                    request.setRequestHeader("authorization", "Bearer " + self.user.token);
                },
                dataType: "json",
                url: "https://dev-api.maul.is/location/" + self.user.location + "/menus/" + self.selectedYear + "-W" + (self.selectedWeek < 10 ? `0${self.selectedWeek}` : self.selectedWeek),
                success: function (obj) {
                    console.log("obj is:", obj);
                    self.menu = obj[0].Menu;
                }
            });
        },
        SelectItem(dayIndex, dish) {
            this.selectedItems[dayIndex] = dish;
            this.ForceRerender();
        },
        CardColor(dayIndex, dishId) {
            if (this.selectedItems[dayIndex] !== undefined) {
                if (this.selectedItems[dayIndex].MenuItemId == dishId) {
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
                UserId: this.user.uuid,
                Email: this.user.email,
                IsoWeek: this.selectedYear + "-W" + (this.selectedWeek < 10 ? `0${this.selectedWeek}` : this.selectedWeek),
                MealTime: "Lunch", // todo
                Order: {}
            };
            for (const dayIndex in this.selectedItems) {
                let dish = this.selectedItems[dayIndex];
                if (dish) {
                    let WeekdayNumber = Number(dayIndex);
                    console.log(dish)
                    data.Order[WeekdayNumber] = {
                        MenuItemId: dish.MenuItemId,
                        RestaurantId: dish.RestaurantId,
                        RestaurantName: dish.RestaurantName,
                        Diet: dish.Diet,
                        DietTypes: dish.DietTypes,
                        Description: dish.Description.is,
                        ShortDescription: dish.ShortDescription.is,
                        WeekdayNumber: String(WeekdayNumber),
                        SelfPickup: false, // todo
                        DescriptionByLang: dish.Description,
                        ShortDescriptionByLang: dish.ShortDescription,
                        Allergens: dish.Allergens,
                        AllergensProvided: dish.AllergensProvided,
                    }
                }
            }
            console.log(data);
            var self = this;
            $.ajax({
                beforeSend: (request) => {
                    request.setRequestHeader("authorization", "Bearer " + self.user.token);
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
