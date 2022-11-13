<template>
   <div id="app">
      <v-app>
         <v-main>
            <v-container fluid fill-height>
               <v-layout align-center justify-center>
                  <v-flex xs12 sm8 md4>
                     <v-card class="elevation-12">
                        <v-toolbar dark color="primary">
                           <v-toolbar-title>Login to Maul</v-toolbar-title>
                        </v-toolbar>
                        <v-card-text>
                           <form ref="form" @submit.prevent="isRegister ? register() : login()">
                              <v-text-field v-model="username" name="username" label="Username" type="text"
                                 placeholder="username" required></v-text-field>

                              <v-text-field v-model="password" name="password" label="Password" type="password"
                                 placeholder="password" required></v-text-field>

                              <v-text-field v-if="isRegister" v-model="confirmPassword" name="confirmPassword"
                                 label="Confirm Password" type="password" placeholder="cocnfirm password" required>
                              </v-text-field>
                              <div class="red--text"> {{ errorMessage }}</div>
                              <v-btn type="submit" class="mt-4" color="primary" value="log in">Login</v-btn>
                           </form>
                        </v-card-text>
                     </v-card>

                  </v-flex>
               </v-layout>
            </v-container>
         </v-main>
      </v-app>
   </div>
</template>

<script>
import { AuthenticationDetails, CognitoUserPool, CognitoUser } from 'amazon-cognito-identity-js/dist/amazon-cognito-identity';
import $ from 'jquery'

export default {
   name: "App",
   data() {
      return {
         username: "",
         password: "",
         confirmPassword: "",
         isRegister: false,
         errorMessage: "",
         stateObj: {
            login: {
               name: 'Login',
               message: 'Register'
            }
         }
      };
   },
   methods: {
      login() {
         const { username, password } = this;


         var authenticationData = {
            Username: username,
            Password: password,
         };
         var authenticationDetails = new AuthenticationDetails(
            authenticationData
         );
         var poolData = {
            UserPoolId: 'eu-west-1_KkkgJsbfo',
            ClientId: '2qavs2k3odmgef85si7bv02qjb',
         };
         var userPool = new CognitoUserPool(poolData);
         var userData = {
            Username: authenticationData.Username,
            Pool: userPool,
         };
         var cognitoUser = new CognitoUser(userData);

         var self = this;
         cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess: function (result) {
               var accessToken = result.getAccessToken().getJwtToken();
               var idToken = result.getIdToken();

               $.ajax({
                  beforeSend: function (request) {
                     request.setRequestHeader("authorization", "Bearer " + accessToken);
                  },
                  dataType: "json",
                  url: "https://dev-api.maul.is/users/" + idToken.payload.sub,
                  success: function (obj) {
                     self.$router.replace({
                        name: "dashboard", params: {
                           email: idToken.payload.email,
                           name: idToken.payload.name,
                           uuid: idToken.payload.sub,
                           token: accessToken,
                           location: obj.LocationId,
                        }
                     });
                  }
               });

            },

            onFailure: function (err) {
               alert(err.message || JSON.stringify(err));
            },
         });



      },
      register() {
         if (this.password == this.confirmPassword) {
            this.isRegister = false;
            this.errorMessage = "";
            this.$refs.form.reset();
         }
         else {
            this.errorMessage = "password did not match"
         }
      }
   },
   computed: {
      toggleMessage: function () {
         return this.isRegister ? this.stateObj.register.message : this.stateObj.login.message
      }
   }
};
</script>