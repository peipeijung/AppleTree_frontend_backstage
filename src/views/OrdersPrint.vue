<template>
  <main class="container">
    <h2>訂單列印</h2>
    <br/>
    <!--    <h7 class="subtitle">-->
    <!--      訂單編號：{{ xOrderId }}<br/>-->
    <!--    </h7>-->
    <br/>

    <!-- 移到表格外部 -->
    <button type="button" class="btn btn-outline-dark" @click="exportToPDF">
      PDF
    </button>

    <table class="table1" ref="ordersTable1">
      <thead>
      <tr>
        <th>出貨單</th>
      </tr>
      </thead>

      <tbody>
      <tr>
        <td>訂單ID：</td>
        <td>{{ xOrderId }}</td>
      </tr>
      <tr>
        <td>會員姓名：</td>
        <td></td>
      </tr>
      <tr>
        <td>訂購日期：</td>
        <td></td>
      </tr>
      <tr>
        <td>收件人手機：</td>
        <td></td>
      </tr>
      <tr>
        <td>收件地址：</td>
        <td></td>
      </tr>
      </tbody>
    </table>

    <br/>

    <table class="table2" ref="ordersTable2">
      <thead>
      <tr class="text-center">
        <th scope="col">品名</th>
        <th scope="col">顏色</th>
        <th scope="col">數量</th>
        <th scope="col">單價</th>
      </tr>
      </thead>
      <tbody>
      <tr
          v-for="odDTO in filteredOrdersDetailDTOs"
          :key="odDTO.ordersDetailId"
          class="text-center"
      >
        <td>{{ odDTO.productName }}</td>
        <td>{{ odDTO.color }}</td>
        <td>{{ odDTO.quantity }}</td>
        <td>{{ odDTO.price }}</td>
      </tr>
      </tbody>
    </table>
  </main>

</template>

<script>
import axios from "axios";
import jsPDF from "jspdf";
import "jspdf-autotable";
import ArialUnicodeMS from "../assets/fonts/ArialUnicodeMS.ttf";
import * as XLSX from "xlsx"; // 使用具名導入方式

// 要安裝的項目：
// npm install jspdf
// npm install jspdf-autotable
// npm install xlsx

export default {
  data() {
    return {
      xOrderId: this.$route.query.xOrderId,
      ordersDetailDTOs: [],
      NewOrdersDetail: {
        ordersDetailId: '',
        orderId: '',
        specId: '',
        quantity: '',
        price: '',
      },
    };
  },

  methods: {
    formatDate(dateTimeString) {
      const options = {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      };
      const dateTime = new Date(dateTimeString);
      return dateTime.toLocaleString("zh-TW", options);
    },

    resetFormData() {
      this.NewOrdersDetail = {
        ordersDetailId: '',
        orderId: '',
        specId: '',
        quantity: '',
        price: '',
      };
    },

    exportToPDF() {
      const doc = new jsPDF();

      // 添加字體
      doc.addFont(ArialUnicodeMS, "ArialUnicodeMS"); // 為字體指定一個名稱

      // 取得 table1 和 table2 的 HTML 元素
      const table1 = this.$refs.ordersTable1;
      const table2 = this.$refs.ordersTable2;

      // 將表格內容加入 PDF 中
      doc.setFont("ArialUnicodeMS"); // 設置字體
      doc.text("OrderDetails", 10, 10); // 添加繁體中文文本
      doc.autoTable({
        html: table1,
        startY: 20, // 設置 table1 的起始位置
        styles: {
          font: "ArialUnicodeMS",
          //這裏設置字體樣式
          fontStyle: "normal",
        },
      });
      doc.autoTable({
        html: table2,
        startY: doc.lastAutoTable.finalY + 10, // 設置 table2 的起始位置在前一個表格的底部
        styles: {
          font: "ArialUnicodeMS",
          //這裏設置字體樣式
          fontStyle: "normal",
        },
      });

      // 下載 PDF
      doc.save("訂單明細.pdf");
    },

    exportToExcel() {
      // 設定要匯出的資料
      const data = this.filteredOrders.map((order) => ({
        訂單編號: order.orderId,
        訂購日期: this.formatDate(order.orderDate),
        訂單狀態: order.orderStatus,
        送貨地址: order.deliverAddress,
        收件人姓名: order.recipientName,
        收件人手機: order.recipientPhone,
      }));

      // 創建新的Workbook
      const wb = XLSX.utils.book_new();
      // 將資料轉換為Worksheet
      const ws = XLSX.utils.json_to_sheet(data);
      // 將Worksheet添加到Workbook中
      XLSX.utils.book_append_sheet(wb, ws, "訂單列表");

      // 將Workbook轉換為二進制數據
      const wbBinary = XLSX.write(wb, {
        bookType: "xlsx",
        type: "array",
      });

      // 創建Blob對象
      const blob = new Blob([wbBinary], {type: "application/octet-stream"});

      // 下載Excel檔
      const fileName = "訂單列表.xlsx";
      if (navigator.msSaveBlob) {
        // For IE
        navigator.msSaveBlob(blob, fileName);
        console.log(blob);
      } else {
        // For other browsers
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.setAttribute("download", fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        console.log(blob);
        console.log(link);
      }
    },

  },

  mounted() {
    const loggedInMember = sessionStorage.getItem('loggedInMember');
    const loggedInMemberObject = JSON.parse(loggedInMember);
    console.log(loggedInMemberObject);
    if (loggedInMemberObject === null) {
      alert('請先登入');
      this.$router.push('/login');
    } else {
      const role = loggedInMemberObject.authentication;
      console.log(role);
      if (role == '1' || role == '0') {
        // alert('歡迎回來，管理者!!');
      } else {
        alert('權限不足');
        this.$router.push('/');
      }
    }

    this.x = sessionStorage.getItem("x")
    this.y = sessionStorage.getItem("y")

    axios
        .get(`${this.API_URL}/orders/findAllOrdersDetailDTOs`)
        .then((rs) => {
          console.log(rs.data);
          this.ordersDetailDTOs = rs.data;
        });
  },

  computed: {
    filteredOrdersDetailDTOs() {
      const specificOrderId = this.x;
      // 使用 Array.prototype.filter 方法來過濾資料
      return this.ordersDetailDTOs.filter(
          (odDTO) => odDTO.orderId == specificOrderId
      );
    },
  },
};
</script>

<style scoped>

.subtitle {
  color: grey;
}

.custom-link {
  background-color: transparent;
  color: black;
  display: inline-block;
  position: relative;
  text-decoration: none;
  transition: color 0.3s;
}

.custom-link:hover {
  color: gray;
}

.custom-link b-icon {
  display: block;
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
}

.btn-outline-dark {
  position: absolute;
  top: 160px;
  right: 105px;
  margin: 10px;
}

.modal-header {
  position: relative;
}

.close {
  position: absolute;
  top: 10px;
  right: 10px;
}

.table2 {
  border: 3px solid black;
  width: 500px;
}

.table2 th {
  border-bottom: 1px solid black;
}

.table thead th {
  white-space: nowrap;
}

.table tbody th {
  white-space: nowrap;
}

:root {
  --primary-color: #007bff;
}

.table button {
  border: 1px solid var(--primary-color);
  border-radius: 20px;
  padding: 6px 12px;
  background-color: transparent;
  color: var(--primary-color);
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s, color 0.3s;
}

.table button:hover {
  background-color: var(--primary-color);
  color: #fff;
}

.table button {
  margin-right: 0px;
}

</style>
