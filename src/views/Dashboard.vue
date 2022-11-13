<template>
  <div id="app">
    <v-app>
      <!-- Start of Navigation -->
      <nav>
        <!-- Start of app toolbar -->
        <v-toolbar>
          <v-toolbar-title class="text-h6">
            <v-list>
              <v-list-item link>
                <v-list-item-content>
                  <v-list-item-title>
                    {{ user.name || 'Name' }}
                  </v-list-item-title>
                  <v-list-item-subtitle v-on:click="logout">log out</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-toolbar-title>
          <v-spacer></v-spacer>
          <v-app-bar-nav-icon @click.stop="drawer = !drawer" class="hidden-md-and-up"></v-app-bar-nav-icon>
          <v-toolbar-items class="hidden-sm-and-down">
            <v-btn v-for="item in items" :key="item.link" :to="`/dashboard/${item.link}`" text>{{
                item.title
            }}</v-btn>
          </v-toolbar-items>
        </v-toolbar>
        <!-- End of app toolbar -->

        <!-- Start of mobile side menu -->
        <v-navigation-drawer app v-model="drawer" right>
          <!-- Menu title -->
          <v-toolbar flat>
            <v-list>
              <v-list-item>
                <v-list-item-title class="title">Menu</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-toolbar>
          <v-divider></v-divider>
          <!-- Menu Links -->
          <v-list>
            <v-list-item v-for="item in items" :key="item.link" :to="`/dashboard/${item.link}`" exact>
              <v-list-item-content>{{ item.title }}</v-list-item-content>
            </v-list-item>
          </v-list>
        </v-navigation-drawer>
        <!-- End of mobile side menu -->
      </nav>
      <!-- End of Navigation -->

      <v-main>
        <!-- Display view pages here based on route -->
        <router-view></router-view>
      </v-main>
    </v-app>
    <!-- <v-app>
    <v-toolbar color="indigo" dark fixed app>
      <v-toolbar-title class="text-h6">
        <v-list>
        <v-list-item link>
          <v-list-item-content>
            <v-list-item-title class="text-h6">
              {{user.name || 'Name'}}
            </v-list-item-title>
            <v-list-item-subtitle v-on:click="logout">log out</v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
      </v-list>  
      </v-toolbar-title>
      <v-spacer></v-spacer>
        <v-toolbar-items class="hidden-sm-and-down">
          <v-btn v-for="item in items" :key="item.icon" :to="item.link" flat>{{
            item.title
          }}</v-btn>
        </v-toolbar-items>
        <v-menu class="hidden-md-and-up">
          <v-toolbar-side-icon slot="activator"></v-toolbar-side-icon>
          <v-list>
            <v-list-item v-for="item in items" :key="item.icon">
              <v-list-item-content>
                <v-list-item-title>{{ item.title }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-menu>
    </v-toolbar>
    <v-navigation-drawer permanent>
      <v-list>
        <v-list-item class="px-2">
        <v-list-item-avatar>
        <v-img src="https://randomuser.me/api/portraits/women/85.jpg"></v-img>
        </v-list-item-avatar>
        </v-list-item>

        <v-list-item link>
          <v-list-item-content>
            <v-list-item-title class="text-h6">
              {{user.name || 'Name'}}
            </v-list-item-title>
            <v-list-item-subtitle v-on:click="logout">log out</v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
      </v-list>

      <v-divider></v-divider>

      <v-list dense nav>
        <v-list-item v-for="item in items" :key="item.title" link>
          <v-list-item-icon>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-icon>

          <v-list-item-content>
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-main>
      <v-container>
        <v-text-field label="Message" v-model="message"></v-text-field>
      </v-container>
    </v-main>
  </v-app> -->
  </div>
</template>

<script>
export default {
  data() {
    return {
      items: [
        { title: 'My Orders', link: 'orders' },
        { title: 'Order', link: 'order' },
        { title: 'About', link: 'about' },
      ],
      user: {
        name: this.$route.params.name,
        email: this.$route.params.email,
        token: this.$route.params.token,
        uuid: this.$route.params.uuid,
        location: this.$route.params.location,
      },
      drawer: false, // Hide mobile side menu by default
    }
  },
  mounted() {
    // Retain user information even though the user refreshes the window
    if (this.user.name === undefined) {
      this.user = JSON.parse(localStorage.getItem('user_info')) || [];
    }
    else {
      localStorage.setItem('user_info', JSON.stringify(this.user));
    }
  },
  methods: {
    logout() {
      this.user = undefined;
      this.$router.replace({ name: 'login' })
    }
  },
  provide: function () {
    return {
      user: this.user
    }
  }
}
</script>