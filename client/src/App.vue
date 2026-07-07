<script setup lang="ts">
import { useColorMode } from '@vueuse/core';
import { ref } from "vue"

import { Button } from './components/ui/button';
import { Separator } from '@/components/ui/separator'

import { LogIn } from "@lucide/vue";

const colorMode = useColorMode()

const isLogged = ref(false)

colorMode.value = "dark" //default olarak dark tanımladım daha sonra switcher eklenebilir
</script>

<template>
  <main class="grid grid-cols-10 gap-4 py-10">
    <div class="col-span-6 col-start-3">
      <div class="flex flex-row mb-2"> 
        <h1 class="text-4xl font-bold">Mangile-Importer</h1>
        <span class="grow"/>
        <Button v-if="!isLogged" class="cursor-pointer" variant="outline"><LogIn /> Giriş Yap</Button>
      </div>
      <Separator class="w-full mt-2" />
    </div>
  </main>
</template>
