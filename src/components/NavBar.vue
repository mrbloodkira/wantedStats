<template>
    <nav id="nav">
      <h1>WantedStats v0.1</h1>
    <RouterLink to="/">
      Home
    </RouterLink>
    <RouterLink to="/Dicas">
      Dicas
    </RouterLink>
    <RouterLink to="/Coliseu">
      Coliseu
    </RouterLink>
    <RouterLink to="/Faq">
      FAQ
    </RouterLink>
    
  </nav>
</template>

<script>
    export default {
        name: "NavBar"
    }
</script>

<style scoped>
#nav {
  display: flex;
  justify-content: center;  
  align-items: center;      
 position: absolute;
  top: 0;                   
  left: 0;                  
  width: 100%;               
  background-color: #a47864;   
  color: #fee9de;             
  padding: 10px 0;           
  z-index: 1000;             
}
#nav h1 {
  color: #fee9de;                   
  margin: 0 15px;            
  font-size: 26px;           
}

#nav a {
  color: #fee9de;             
  text-decoration: none;     
  margin: 0 15px;           
  font-size: 16px;           
}

#nav a:hover {
  text-decoration: underline; 
}
</style>