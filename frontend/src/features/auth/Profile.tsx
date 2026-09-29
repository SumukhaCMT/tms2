import { useAuth } from "@/features/auth/useAuth";

function Profile() {
  const { user } = useAuth();

  return (
    <div className="max-w-2xl mx-auto mt-6 rounded-xl border bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Profile Details</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">

        {user?.name && (
          <div>
            <p className="text-gray-500">Name</p>
            <p className="font-medium">{user.name}</p>
          </div>
        )}

        {user?.email && (
          <div>
            <p className="text-gray-500">Email</p>
            <p className="font-medium">{user.email}</p>
          </div>
        )}

        {user?.user_type && (
          <div>
            <p className="text-gray-500">Role</p>
            <p className="font-medium">{user.user_type}</p>
          </div>
        )}

        {user?.phone && (
          <div>
            <p className="text-gray-500">Mobile</p>
            <p className="font-medium">{user.phone}</p>
          </div>
        )}

        {user?.organization_id && (
          <div>
            <p className="text-gray-500">Organization ID</p>
            <p className="font-medium">{user.organization_id}</p>
          </div>
        )}

        {user?.temple_id && (
          <div>
            <p className="text-gray-500">Temple ID</p>
            <p className="font-medium">{user.temple_id}</p>
          </div>
        )}

      </div>
    </div>
  );
}

export default Profile;
