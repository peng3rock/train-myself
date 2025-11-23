<template>
  <header class="header">
      <h1 class="header-title">Train Myself</h1>
    <button class="add-button" @click="$emit('add-click')">
      + 添加目标
    </button>
  </header>
</template>

<script setup lang="ts">
defineEmits<{
  'add-click': []
}>()
</script>

<style scoped>
.header {
  background: white;
  border-radius: 16px;
  padding: 24px 32px;
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.header-title {
  font-size: 28px;
  font-weight: 700;
  color: #333;
  margin: 0;
}

.add-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.add-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(102, 126, 234, 0.4);
}

.add-button:active {
  transform: translateY(0);
}

@media (max-width: 600px) {
  .header {
    padding: 16px 20px;
    flex-direction: column;
    gap: 16px;
  }
  
  .header-title {
    font-size: 24px;
  }
  
  .add-button {
    width: 100%;
  }
}
</style>

