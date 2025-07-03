import request from "@/api/apiConfig";

export async function infos() {
  return request<{ name: string; version: string }>({
    url: '/api/infos',
    method: 'GET',
  })
}
