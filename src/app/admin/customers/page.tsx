import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import CustomersClient from "./CustomersClient";

export const dynamic = 'force-dynamic';

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: { search?: string; page?: string };
}) {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

  await connectToDatabase();

  // Build query - only customers
  const query: any = { role: 'customer' };
  if (searchParams.search) {
    const searchLower = searchParams.search.toLowerCase();
    query.$or = [
      { name: { $regex: searchLower, $options: 'i' } },
      { email: { $regex: searchLower, $options: 'i' } },
      { phone: { $regex: searchLower, $options: 'i' } },
    ];
  }

  // Pagination
  const page = parseInt(searchParams.page) || 1;
  const limit = 10;
  const skip = (page - 1) * limit;

  const [customers, totalCount] = await Promise.all([
    User.find(query)
      .select('name email phone address status createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    User.countDocuments(query),
  ]);

  const serializedCustomers = JSON.parse(JSON.stringify(customers));
  const totalPages = Math.ceil(totalCount / limit);

  return (
    <CustomersClient
      initialCustomers={serializedCustomers}
      totalPages={totalPages}
      currentPage={page}
    />
  );
}
