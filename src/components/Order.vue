<template>
    <v-container fluid>
        <v-dialog v-model="dialog" max-width="290">
            <v-card>
                <v-card-title class="text-h5">
                    Order successfull
                </v-card-title>

                <v-card-text>
                    Todo display order
                </v-card-text>

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
                <v-row v-for="(dayMenu, dayIndex) in menu" :key="`dayMenu-${dayIndex}`">
                    <v-col>
                        <v-row v-if="dayMenu.length > 0">
                            <h1>{{ Weekday(dayIndex + 1) }}</h1>
                        </v-row>
                        <v-row v-for="(dish, dishIndex)  in dayMenu" :key="`dish-${dishIndex}`">
                            <v-col>
                                <v-card v-if="renderComponent" @click="SelectItem(dayIndex, dishIndex)"
                                    :color="CardColor(dayIndex, dishIndex)">
                                    <v-card-title><b>{{ dish.Diet }}:</b>&nbsp;{{ dish.ShortDescription.en }}</v-card-title>
                                    <v-card-subtitle><b>{{ dish.RestaurantName }}</b></v-card-subtitle>
                                    <v-card-text>
                                        <v-row>
                                            <v-col>{{ dish.Description.en }}</v-col>
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
    name: 'About',
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
            }
            return "Unknown";
        },
        CurrentWeekNumber() {
            let currentDate = new Date();
            let startDate = new Date(currentDate.getFullYear(), 0, 1);
            var days = Math.floor((currentDate - startDate) /
                (24 * 60 * 60 * 1000));

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
            if (this.selectedWeek < 52) {
                this.selectedYear -= 1;
                this.selectedWeek = 52;
            }
            this.Update();
        },
        Update() {
            var self = this;
            this.selectedItems = {};
            $.ajax({
                beforeSend: function (request) {
                    request.setRequestHeader("authorization", "Bearer " + self.user.token);
                },
                dataType: "json",
                url: "https://dev-api.maul.is/location/" + self.user.location + "/menus/" + self.selectedYear + "-W" + self.selectedWeek,
                success: function (obj) {
                    self.menu = obj[0].Menu;
                }
            });
        },
        SelectItem(dayIndex, dishIndex) {
            this.selectedItems[dayIndex] = dishIndex;
            this.ForceRerender();
        },
        CardColor(dayIndex, dishIndex) {
            if (this.selectedItems[dayIndex] !== undefined) {
                if (this.selectedItems[dayIndex] == dishIndex) {
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
                IsoWeek: this.selectedYear + "-W" + this.selectedWeek,
                Order: {}
            };
            for (const key in this.selectedItems) {
                let dish = this.menu[key][this.selectedItems[key]];
                console.log(dish);
                let WeekdayNumber = Number(key) + 1;
                data.Order[WeekdayNumber] = {
                    MenuItemId: dish.MenuItemId,
                    RestaurantId: dish.RestaurantId,
                    RestaurantName: dish.RestaurantName,
                    Diet: dish.Diet,
                    Description: dish.Description.is,
                    ShortDescription: dish.ShortDescription.is,
                    WeekdayNumber: String(WeekdayNumber),
                    SelfPickup: false, // todo 
                    DescriptionByLang: dish.Description,
                    ShortDescriptionByLang: dish.ShortDescription,
                }
            }
            console.log(data);
            var self = this;
            $.ajax({
                beforeSend: function (request) {
                    request.setRequestHeader("authorization", "Bearer " + self.user.token);
                },
                type: "POST",
                dataType: "json",
                url: "https://dev-api.maul.is/orders",
                data: JSON.stringify(data),
                success: function (response) {
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