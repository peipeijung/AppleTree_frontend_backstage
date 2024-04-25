import { defineStore } from "pinia";

export const useMemberStore = defineStore("memberStore", {
  state: () => ({
   memberId:"",
   memberName:"",
   memberPhoto:"",
    isLoggedIn: false,
  }),
  actions: {
    loginSuccess(member) {
      this.memberId = member.memberId;
      this.memberName = member.memberName;
      this.memberPhoto = member.memberPhoto;
      this.isLoggedIn = true;
    },
    logout() {
      this.memberId = "";
      this.memberName = "";
      this.memberPhoto = "";
      this.isLoggedIn = false;
    },
  },
  getters: {},
});
