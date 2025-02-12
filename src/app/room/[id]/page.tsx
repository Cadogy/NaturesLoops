import { getRooms, type Room } from '../../../utils/roomsData'
import { notFound } from 'next/navigation'
import RoomClient from './room-client'

interface PageParams {
  id: string
}

interface Props {
  params: Promise<PageParams>
}

async function resolveParams(params: Promise<PageParams>): Promise<PageParams> {
  return await params
}

export default async function Page({ params }: Props) {
  const resolvedParams = await resolveParams(params)
  const rooms = await getRooms()
  
  if (!rooms || rooms.length === 0) {
    notFound()
  }

  const room = rooms.find((r: Room) => r.id === resolvedParams.id)
  if (!room) {
    notFound()
  }

  return <RoomClient initialRoom={room} allRooms={rooms} />
} 