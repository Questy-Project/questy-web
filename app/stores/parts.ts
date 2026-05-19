  import { defineStore } from 'pinia'
  import type { Parts } from '~/types'

  export const usePartsStore = defineStore('parts', () =>{
    const stock = ref(0)
    const loading= ref(false)
    const error = ref<string | null> (null)

    async function fetchParts(){
        loading.value = true
        error.value = null

        try{
            const data = await useApi<Parts>('/parts/me')
            stock.value = data.stock
        }catch{
            error.value = 'Impossible de charger le stock de parties'
        }finally{
            loading.value = false
        }
    }
    return {stock, loading, error, fetchParts}
  })