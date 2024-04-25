import { defineStore } from "pinia";

export const useUserStore = defineStore("userStore", {
  state() {
    return {
      userId: "",
      userName: "",
      userEmail: "",
      userAuthentication: "",
      isLoggedIn: false,
    };
  },
  actions: {
    loginSuccess(user) {
      this.userId = user.userId;
      this.userName = user.userName;
      this.userEmail = user.userEmail;
      this.userAuthentication = user.userAuthentication;
      this.isLoggedIn = true;
    },

    logout() {
      this.userId = "";
      this.userName = "";
      this.userEmail = "";
      this.userAuthentication = "";
      this.isLoggedIn = false;
    },
  },
  getters: {},
});
