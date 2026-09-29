type Props = {
  userId: number
  name: string
}

export default function UserDashboard({ userId, name }: Props) {
  return (
    <div>
      <h2 className="text-xl font-semibold">Users Dashboard</h2>

      <p className="text-sm text-muted-foreground">
        User ID: {userId} - {name}
      </p>

      <ul className="mt-4 space-y-2">
        <li>🙏 My Bookings</li>
        <li>💳 My Donations</li>
        <li>📜 My History</li>
      </ul>
    </div>
  )
}
