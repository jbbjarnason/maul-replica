<template>
    <v-container fluid>
        <v-layout>
            <v-container>
                <h1>My orders for week {{ selectedWeek }}</h1>
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
                <v-row v-for="order in orders" :key="order.WeekdayNumber">
                    <v-col>
                        <v-card>
                            <v-card-title>
                                <b>{{ Weekday(order.WeekdayNumber) }}:</b>&nbsp;{{ order.ShortDescriptionByLang.en }}
                            </v-card-title>
                            <v-card-subtitle><b>{{ order.RestaurantName }}</b></v-card-subtitle>
                            <v-card-text>{{ order.DescriptionByLang.en }}</v-card-text>
                        </v-card>
                    </v-col>
                </v-row>
            </v-container>
        </v-layout>
    </v-container>
</template>

<script>
import $ from 'jquery'
export default {
    data() {
        return {
            orders: [],
            selectedWeek: 0,
            selectedYear: 0,
        }
    },
    inject: ['user'],
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
            this.Update();
        },
        Update() {
            var self = this;
            self.orders = [];
            $.ajax({
                beforeSend: function (request) {
                    request.setRequestHeader("authorization", "Bearer " + self.user.token);
                },
                dataType: "json",
                url: "https://dev-api.maul.is/users/" + self.user.uuid + "/orders/" + self.selectedYear + "-W" + self.selectedWeek,
                success: function (obj) {
                    self.orders = Object.keys(obj).map((key) => obj[key]);
                }
            });
        }
    }
}
</script>