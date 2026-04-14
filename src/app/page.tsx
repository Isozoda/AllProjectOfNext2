"use client"

import axios from "axios"
import { Button } from '@/components/ui/button'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card'

import { Input, Modal } from "antd"

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from "react"
import { Controller, useForm } from "react-hook-form"

const api = "http://37.27.29.18:8001/api/to-dos"
const apiImage = "http://37.27.29.18:8001/images"
const apiCheck = "http://37.27.29.18:8001/completed"


const Page = () => {

  const queryClient = useQueryClient()

  const { isPending, error, data } = useQuery({
    queryKey: ['getTodos'],
    queryFn: async () => {
      const { data } = await axios.get(api)
      return data.data
    }
  })
  const deleteTodo = useMutation({
    mutationFn: async (id: number) => {
      await axios.delete(`${api}?id=${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['getTodos'] })
    }
  })
  const deleteImage = useMutation({
    mutationFn: async (id: number) => {
      await axios.delete(`${api}/images/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['getTodos'] })
    }
  })
  const checkStatus = useMutation({
    mutationFn: async (id: number) => {
      await axios.put(`${apiCheck}?id=${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['getTodos'] })
    }
  })
  const editUser = useMutation({
    mutationFn: async (obj: any) => {
      await axios.put(`${api}?id=${obj.id}`, obj)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['getTodos'] })
    }
  })
  const addnNewUser = useMutation({
    mutationFn: async (formdata: any) => {
      await axios.post(api, formdata)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['getTodos'] })
    }
  })
  const addImage = useMutation({
    mutationFn: async ({ formdata, id }: any) => {
      await axios.post(`${api}/${id}/images`, formdata)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['getTodos'] })
    }
  })

  //state

  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const [isModalOpenE, setIsModalOpenE] = useState(false);

  const showModalE = () => {
    setIsModalOpenE(true);
  };

  const handleOkE = () => {
    setIsModalOpenE(false);
  };

  const handleCancelE = () => {
    setIsModalOpenE(false);
  };

  const [isModalOpenimageAdd, setIsModalOpenimageAdd] = useState(false);

  const showModalimageAdd = () => {
    setIsModalOpenimageAdd(true);
  };

  const handleOkimageAdd = () => {
    setIsModalOpenimageAdd(false);
  };

  const handleCancelimageAdd = () => {
    setIsModalOpenimageAdd(false);
  };
  const [idx, setIdx] = useState(null)

  const { control, handleSubmit, reset, setValue } = useForm({
    defaultValues: {
      name: "",
      description: "",
      file: []
    },
  })

  const onsubmit = (e: any) => {
    if (!idx) {
      const formdata = new FormData()
      formdata.append("name", e.name)
      formdata.append("description", e.description)
      for (let i = 0; i < e.file.length; i++) {
        formdata.append("images", e.file[i])
      }
      addnNewUser.mutate(formdata)
      reset()
      handleCancel()
    }
    else {
      editUser.mutate({ id: idx, ...e })
      reset()
      handleCancelE()
    }
  }

  const onsubmitImage = (e: any) => {
    const formdata = new FormData()
    for (let i = 0; i < e.file.length; i++) {
      formdata.append("images", e.file[i])
    }
    addImage.mutate({ formdata, id: idx })
    handleCancelimageAdd()
  }

  const handlleEdit = (e: any) => {
    setIdx(e.id)
    setValue("name", e.name)
    setValue("description", e.description)
    showModalE()
  }


  if (isPending) return <div className="text-center mt-10">Loading...</div>

  if (error instanceof Error) {
    return <div className="text-center text-red-500">{error.message}</div>
  }

  return (
    <div className='w-[90%] m-auto my-10'>
      <div className='flex items-center mb-10 justify-between'>
        <h1 className='font-bold text-gray-800 text-4xl'>Todos List</h1>
        <Button className="px-6 py-2 text-lg" onClick={showModal}>+ Add New</Button>
      </div>

      <div className="grid md:grid-cols-3 sm:grid-cols-2 gap-8">
        {data?.map((e: any) => (
          <Card key={e.id} className="overflow-hidden hover:shadow-xl transition duration-300">

            <div className="relative">
              {e.images?.map((img: any) => {
                return <div key={img.id}>
                  <img className="w-full h-50" src={`${apiImage}/${img.imageName}`} alt="" />
                  <Button onClick={() => deleteImage.mutate(img.id)} className="ml-3 mt-2" variant={"destructive"}>DlImg</Button>
                </div>
              })}
              <Button className="bg-blue-500 ml-82" onClick={() => {
                setIdx(e.id)
                showModalimageAdd()
              }}>
                Add Image
              </Button>
              <div className={`absolute top-3 right-3 px-3 py-1 text-xs rounded-full text-white
                ${e.isCompleted ? "bg-green-500" : "bg-red-500"}`}>
                {e.isCompleted ? "Active" : "Inactive"}
              </div>
            </div>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                {e.name}
              </CardTitle>
            </CardHeader>

            <CardContent>
              <p className="text-gray-600 text-sm mb-4">
                {e.description}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex gap-4">
                  <button onClick={() => deleteTodo.mutate(e.id)} className="text-red-500 hover:scale-110 transition">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="red" className="size-6">
                      <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                  </button>
                  <button onClick={() => handlleEdit(e)} className="text-blue-500 hover:scale-110 transition">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="blue" className="size-6">
                      <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                    </svg>
                  </button>
                </div>

                <input
                  type="checkbox"
                  onChange={() => checkStatus.mutate(e.id)}
                  checked={e.isCompleted}
                  className="w-5 h-5 accent-green-500"
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Modal
        title="Add Modal"
        closable={{ 'aria-label': 'Custom Close Button' }}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={null}
      >
        <form onSubmit={handleSubmit(onsubmit)} className="flex flex-col gap-4">
          <Controller
            name="name"
            control={control}
            render={({ field }) => <Input placeholder="Name:"  {...field} />}
          />
          <Controller
            name="description"
            control={control}
            render={({ field }) => <Input placeholder="Description:" {...field} />}
          />
          <Controller
            name="file"
            control={control}
            render={({ field }) => (
              <input
                type="file"
                multiple
                onChange={(e) => field.onChange(e.target.files)}
              />
            )}
          />
          <button type="submit" className="w-full bg-blue-500 text-white py-1.5 rounded-xl mt-4">Save</button>
        </form>
      </Modal>
      <Modal
        title="Add Image Modal"
        closable={{ 'aria-label': 'Custom Close Button' }}
        open={isModalOpenimageAdd}
        onOk={handleOkimageAdd}
        onCancel={handleCancelimageAdd}
        footer={null}
      >
        <form onSubmit={handleSubmit(onsubmitImage)} className="flex flex-col gap-4">
          <Controller
            name="file"
            control={control}
            render={({ field }) => (
              <input
                type="file"
                multiple
                onChange={(e) => field.onChange(e.target.files)}
              />
            )}
          />
          <button type="submit" className="w-full bg-blue-500 text-white py-1.5 rounded-xl mt-4">Save</button>
        </form>
      </Modal>
      <Modal
        title="Edit Modal"
        closable={{ 'aria-label': 'Custom Close Button' }}
        open={isModalOpenE}
        onOk={handleOkE}
        onCancel={handleCancelE}
        footer={null}
      >
        <form onSubmit={handleSubmit(onsubmit)} className="flex flex-col gap-4">
          <Controller
            name="name"
            control={control}
            render={({ field }) => <Input placeholder="Name:"  {...field} />}
          />
          <Controller
            name="description"
            control={control}
            render={({ field }) => <Input placeholder="Description:" {...field} />}
          />
          <button type="submit" className="w-full bg-green-500 text-white py-1.5 rounded-xl mt-4">Ubdate</button>
        </form>
      </Modal>
    </div>
  )
}

export default Page