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

                <v-row v-if="errorMessage" align="center">
                    <v-col align="center">
                        <v-alert type="error">{{ errorMessage }}</v-alert>
                    </v-col>
                </v-row>

                <v-row v-for="order in orders" :key="order.WeekdayNumber">
                    <v-col>
                        <v-row>
                            <v-col>
                                <h2 class="day-title">{{ Weekday(order.WeekdayNumber) }}</h2>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col cols="12" md="6" lg="4">
                                <menu-card
                                    :dish="order"
                                    :lang="userData.english ? 'en' : 'is'"
                                    width="100%"
                                />
                            </v-col>
                        </v-row>
                    </v-col>
                </v-row>
            </v-container>
        </v-layout>
    </v-container>
</template>

<script>
import $ from 'jquery'
import MenuCard from './MenuCard.vue'

export default {
    components: {
        MenuCard
    },
    data() {
        return {
            orders: [],
            selectedWeek: 0,
            selectedYear: 0,
            errorMessage: '',
            userData: null,
        }
    },
    inject: ['user'],
    mounted() {
        // Initialize userData with copy of injected user
        this.userData = { ...this.user };
        
        // Check if user info needs to be restored from localStorage
        const userInfo = localStorage.getItem('user_info');
        if (userInfo) {
            this.userData = JSON.parse(userInfo);
        }

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
            self.errorMessage = '';

            // Ensure we have valid user info before making the request
            if (!self.userData || !self.userData.token || !self.userData.uuid) {
                console.error('User information is missing');
                // No user info, redirect to login
                self.$router.replace({ name: 'login' });
                return;
            }

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
                            self.orders = orderArray.sort((a, b) => 
                                Number(a.WeekdayNumber) - Number(b.WeekdayNumber)
                            );
                        } else {
                            self.errorMessage = `No orders found for: Year ${self.selectedYear}, Week ${self.selectedWeek}`;
                        }
                    } else {
                        console.error('Unexpected response format:', obj);
                        self.orders = [];
                        self.errorMessage = `No orders found for: Year ${self.selectedYear}, Week ${self.selectedWeek}`;
                    }
                },
                error: function(err) {
                    console.error('Failed to fetch orders:', err);
                    self.orders = [];
                    self.errorMessage = 'Something went wrong, could not fetch orders.';
                }
            });
        }
    }
}
</script>

<style scoped>
.day-title {
    font-size: 1.5rem;
    font-weight: 600;
    padding: 12px 16px;
    margin: 16px 0;
    border-bottom: 2px solid #e0e0e0;
    color: #424242;
}

@media (max-width: 600px) {
    .day-title {
        font-size: 1.3rem;
        padding: 8px 12px;
        margin: 12px 0;
    }
}
</style>
