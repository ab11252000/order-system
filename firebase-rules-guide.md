# Firebase Firestore 安全規則設定指南

## ⚠️ 重要：你必須設定這些規則！

目前你的 Firebase API Key 是公開的（這是正常的），但如果 Firestore Rules 設定不當，任何人都可以讀寫你的資料庫。

---

## 設定步驟

1. 前往 [Firebase Console](https://console.firebase.google.com/)
2. 選擇你的專案 `xiangyue-order`
3. 左側選單點選 **Firestore Database**
4. 點選上方的 **Rules** 分頁
5. 將以下規則貼入並發布：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // 管理員驗證函數
    function isAdmin() {
      return request.auth != null && request.auth.token.email != null;
    }
    
    // 公告設定 - 管理員可讀寫，其他人只能讀
    match /config/{document} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // 店家資料 - 管理員可讀寫，店家可讀取自己的資料
    match /stores/{storeId} {
      allow read: if true;
      allow create: if true;
      allow update, delete: if isAdmin();
    }
    
    // 訂單 - 管理員可讀寫，店家可建立
    match /orders/{orderId} {
      allow read: if isAdmin();
      allow create: if true;
      allow update, delete: if isAdmin();
    }
    
    // 客戶資料 - 只有管理員可存取
    match /customers/{customerId} {
      allow read, write: if isAdmin();
    }
    
    // 封鎖名單 - 只有管理員可存取
    match /blockList/{userId} {
      allow read, write: if isAdmin();
    }
    
    // 其他文件預設拒絕
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

---

## 建立管理員帳號

在 Firebase Console 中：

1. 左側選單點選 **Authentication**
2. 點選 **Sign-in method** 分頁
3. 啟用 **Email/Password**
4. 回到 **Users** 分頁
5. 點選 **Add user**
6. 輸入管理員的 Email 和密碼

這個 Email/密碼就是後台登入用的帳號。

---

## 驗證規則是否生效

設定完成後：
1. 用管理員帳號登入後台
2. 嘗試新增/編輯公告
3. 如果成功，代表規則正確
4. 開啟無痕視窗，直接訪問後台頁面，應該會被導向登入頁

---

## 常見問題

### Q: 為什麼 API Key 可以公開？
A: Firebase 的設計就是讓 API Key 放在前端，安全性由 Firestore Rules 控制。

### Q: 有人可以用我的 API Key 建立大量請求嗎？
A: 可以在 Firebase Console 設定 App Check 和配額限制來防止。
