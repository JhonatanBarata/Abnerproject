# ?? Sistema Admin - Guincho Rio Claro

## ?? O que foi implementado

? **Painel Admin completo** (`/admin.html`)
? **Sistema de autentica��o** (login/logout)
? **CRUD de Mesas** (criar, editar, deletar)
? **CRUD de Tipos** (categorias de mesa)
? **Gerenciar Carrossel** (fotos do banner inicial)
? **Upload de imagens** (autom�tico para Firebase Storage)
? **Integra��o com site** (carrega dados dinamicamente)

---

## ?? Como configurar

### 1. Criar projeto no Firebase

1. Acesse: https://console.firebase.google.com/
2. Clique em **"Adicionar projeto"**
3. Nome: `madeireira-Monteiro Madeiras` (ou o que preferir)
4. Desabilite Google Analytics (opcional)
5. Clique em **"Criar projeto"**

### 2. Configurar Authentication

1. No menu lateral, clique em **"Authentication"**
2. Clique em **"Come�ar"**
3. Ative o m�todo **"Email/senha"**
4. Clique em **"Usu�rios"** ? **"Adicionar usu�rio"**
5. Cadastre seu email e senha (voc� vai usar para login)

### 3. Configurar Firestore Database

1. No menu lateral, clique em **"Firestore Database"**
2. Clique em **"Criar banco de dados"**
3. Modo: **"Produ��o"** (vamos configurar regras depois)
4. Local: **"southamerica-east1"** (S�o Paulo)
5. Clique em **"Ativar"**

### 4. Configurar Storage

1. No menu lateral, clique em **"Storage"**
2. Clique em **"Come�ar"**
3. Modo: **"Produ��o"**
4. Local: **"southamerica-east1"**
5. Clique em **"Concluir"**

### 5. Configurar Regras de Seguran�a

**Firestore (Database):**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir leitura p�blica (site)
    match /{document=**} {
      allow read: if true;
    }
    
    // Permitir escrita apenas para usu�rios autenticados (admin)
    match /{document=**} {
      allow write: if request.auth != null;
    }
  }
}
```

**Storage:**
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Permitir leitura p�blica
    match /{allPaths=**} {
      allow read: if true;
    }
    
    // Permitir upload apenas para usu�rios autenticados
    match /{allPaths=**} {
      allow write: if request.auth != null;
    }
  }
}
```

### 6. Obter credenciais do Firebase

1. Clique no �cone de **engrenagem** ?? ? **"Configura��es do projeto"**
2. Role at� **"Seus apps"**
3. Clique no �cone **</> Web**
4. Nome do app: `Guincho Rio Claro Admin`
5. **N�O** marque Firebase Hosting
6. Clique em **"Registrar app"**
7. **COPIE** o c�digo que aparece em `firebaseConfig`

### 7. Colar credenciais no projeto

Copie `firebase-config.local.example.js` para `firebase-config.local.js` e preencha:

```javascript
window.__FIREBASE_CONFIG__ = {
  apiKey: "AIza...",  // ? Cole aqui
  authDomain: "seu-projeto.firebaseapp.com",
  projectId: "seu-projeto-id",
  storageBucket: "seu-projeto.firebasestorage.app",
  messagingSenderId: "123456789",
  appId: "1:123...:web:abc..."
};
```

---

## ?? Como usar o painel admin

### Acessar o painel

1. Abra: `http://localhost:5173/admin.html` (ou seu dom�nio + `/admin.html`)
2. Fa�a login com email/senha cadastrados no Firebase
3. Pronto! ??

### Gerenciar Tipos de Mesa

1. Clique na aba **"??? Tipos"**
2. Clique em **"+ Adicionar Tipo"**
3. Digite o nome: `Garapeira`, `Pequi�`, `Angelim`, etc
4. Salve

### Adicionar Mesa

1. Clique na aba **"?? Mesas"**
2. Clique em **"+ Adicionar Mesa"**
3. Preencha:
   - **Tipo**: Escolha da lista (Garapeira, Pequi�...)
   - **Nome**: Ex: "Mesa de Garapeira Grande"
   - **Descri��o**: Texto livre
   - **Especifica��es**: Uma por linha (ex: `Madeira: Garapeira nobre`)
   - **Fotos**: Selecione m�ltiplas imagens
4. Clique em **"Salvar Mesa"**
5. A mesa aparece automaticamente no site! ?

### Editar/Deletar Mesa

- Clique em **"Editar"** para modificar
- Clique em **"Deletar"** para remover (pede confirma��o)

### Gerenciar Carrossel

1. Clique na aba **"??? Carrossel"**
2. Veja as 8 fotos atuais
3. Clique em **"� "** para remover foto
4. Clique em **"+ Adicionar Foto"** para nova
5. Site atualiza instantaneamente! ??

---

## ?? Integra��o com o site

### Arquivos modificados:

Voc� precisa adicionar nos seus HTMLs:

**Em `colecao.html`** (antes de `</body>`):
```html
<!-- Firebase SDK -->
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-storage-compat.js"></script>
<script src="firebase-config.local.js"></script>
<script src="firebase-config.js"></script>
<script src="load-mesas.js"></script>
```

**Em `index.html`** (antes de `</body>`):
```html
<!-- Firebase SDK -->
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore-compat.js"></script>
<script src="firebase-config.local.js"></script>
<script src="firebase-config.js"></script>
<script src="load-carrossel.js"></script>
```

**Em `colecao.html`**, altere o container das mesas:
```html
<!-- Trocar o conte�do hardcoded por: -->
<div id="colecao-lista" class="max-w-7xl mx-auto grid md:grid-cols-3 gap-16">
  <!-- Mesas ser�o carregadas aqui pelo JavaScript -->
</div>
```

---

## ?? Deploy

### Op��o 1: Vercel (Recomendado - Gr�tis)

1. Suba c�digo no GitHub
2. Conecte Vercel ao reposit�rio
3. Deploy autom�tico
4. Acesse: `seusite.vercel.app/admin.html`

### Op��o 2: Netlify (Alternativa)

1. Arraste pasta para Netlify Drop
2. Site no ar em segundos
3. Acesse: `seusite.netlify.app/admin.html`

### Op��o 3: Hospedagem tradicional (FTP)

1. Suba todos os arquivos via FileZilla
2. Acesse: `seudominio.com.br/admin.html`

---

## ?? Seguran�a

? **Autentica��o obrigat�ria** para admin  
? **Leitura p�blica** (visitantes veem o site)  
? **Escrita protegida** (s� admin logado edita)  
? **Credenciais no Firebase** (n�o no c�digo)  
? **HTTPS autom�tico** (Vercel/Netlify)  

---

## ?? Troubleshooting

### Erro: "Firebase not defined"
- Ordem atual: Firebase SDK -> firebase-config.local.js -> firebase-config.js -> load-mesas.js
- Verifique se as tags `<script>` do Firebase est�o **ANTES** dos seus scripts
- Ordem correta: Firebase SDK ? firebase-config.js ? load-mesas.js

### Erro: "Email ou senha incorretos"
- Verifique se criou usu�rio no Firebase Authentication
- Tente resetar senha no Firebase Console

### Fotos n�o aparecem
- Verifique regras do Storage (deve permitir leitura p�blica)
- Teste upload de 1 foto pequena primeiro

### Site n�o atualiza
- Limpe cache do navegador (Ctrl + Shift + R)
- Verifique console do navegador (F12) para erros

---

## ?? Suporte

D�vidas? Entre em contato ou verifique a documenta��o do Firebase:
- https://firebase.google.com/docs

---

**Desenvolvido para Guincho Rio Claro** ???
