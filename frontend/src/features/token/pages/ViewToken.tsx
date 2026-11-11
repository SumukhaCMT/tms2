import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import {
  selectSelectedToken,
  selectTokensError,
  selectTokensLoading,
} from "../tokenSelectors";
import { fetchTokenById } from "../tokenThunks";

const ViewToken = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();

  const token = useAppSelector(selectSelectedToken);
  const loading = useAppSelector(selectTokensLoading);
  const error = useAppSelector(selectTokensError);

  const tokenId = Number(id);
  const validId = Number.isInteger(tokenId) && tokenId > 0;

  useEffect(() => {
    if (validId) {
      void dispatch(fetchTokenById(tokenId));
    }
  }, [dispatch, tokenId, validId]);

  if (!validId) {
    return <p className="p-6 text-red-600">Invalid token ID.</p>;
  }

  if (loading && (!token || token.id !== tokenId)) {
    return <p className="p-6">Loading token details...</p>;
  }

  if (error && (!token || token.id !== tokenId)) {
    return (
      <main className="space-y-4 p-6">
        <p role="alert" className="text-red-600">{error}</p>
        <Link to="/tokens" className="text-blue-600 hover:underline">
          Back to Tokens
        </Link>
      </main>
    );
  }

  if (!token || token.id !== tokenId) {
    return (
      <main className="space-y-4 p-6">
        <p>Token not found.</p>
        <Link to="/tokens" className="text-blue-600 hover:underline">
          Back to Tokens
        </Link>
      </main>
    );
  }

  const details = [
    ["Token ID", token.id],
    ["Token Code", token.token_code],
    ["Token Name", token.token_name],
    ["Temple ID", token.temple_id],
    ["Seva ID", token.seva_id ?? "—"],
    ["Deity ID", token.deity_id ?? "—"],
    ["Display Order", token.token_display_order],
    ["Status", token.token_status],
    ["Description", token.token_description || "—"],
    [
      "Created At",
      token.created_at
        ? new Date(token.created_at).toLocaleString()
        : "—",
    ],
    [
      "Updated At",
      token.updated_at
        ? new Date(token.updated_at).toLocaleString()
        : "—",
    ],
  ];

  return (
    <main className="space-y-6 p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link to="/tokens" className="text-sm text-blue-600 hover:underline">
            ← Back to Tokens
          </Link>
          <h1 className="mt-3 text-2xl font-bold">Token Details</h1>
        </div>

        <Link
          to={`/tokens/${token.id}/edit`}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Edit Token
        </Link>
      </div>

      <div className="overflow-hidden rounded-lg border bg-white">
        <dl className="divide-y">
          {details.map(([label, value]) => (
            <div
              key={String(label)}
              className="grid grid-cols-1 gap-1 px-4 py-4 sm:grid-cols-3"
            >
              <dt className="text-sm font-medium text-gray-500">{label}</dt>
              <dd className="break-words text-sm sm:col-span-2">
                {String(value)}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </main>
  );
};

export default ViewToken;