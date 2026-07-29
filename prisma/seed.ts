import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient({ 
  log: ['query']
});

async function main() {
  console.log('Seeding database...');
  
  // Wipe existing data to ensure a clean state
  await prisma.message.deleteMany();
  await prisma.trade.deleteMany();
  await prisma.offer.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.follow.deleteMany();
  await prisma.rating.deleteMany();

  // 1. Create users
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const user1 = await prisma.user.upsert({
    where: { email: 'alice@example.com' },
    update: {},
    create: {
      email: 'alice@example.com',
      name: 'Alice',
      username: 'alice',
      hashedPassword,
      role: 'USER',
      reputation: 4.8,
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'bob@example.com' },
    update: {},
    create: {
      email: 'bob@example.com',
      name: 'Bob',
      username: 'bob',
      hashedPassword,
      role: 'USER',
      reputation: 4.2,
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin',
      hashedPassword,
      role: 'ADMIN',
    },
  });

  // 2. Create listings
  const listing1 = await prisma.listing.create({
    data: {
      userId: user1.id,
      title: 'Vintage Film Camera',
      description: 'Fully functional 35mm film camera in great condition.',
      category: 'Electronics',
      condition: 'GOOD',
      tags: JSON.stringify(['camera', 'vintage', 'photography']),
      location: 'New York, NY',
      images: JSON.stringify(['https://images.unsplash.com/photo-1516961642265-531546e84af2?auto=format&fit=crop&q=80&w=600']),
    },
  });

  const listing2 = await prisma.listing.create({
    data: {
      userId: user2.id,
      title: 'Acoustic Guitar',
      description: 'Beginner acoustic guitar, slightly scratched but plays perfectly.',
      category: 'Instruments',
      condition: 'FAIR',
      tags: JSON.stringify(['guitar', 'music', 'acoustic']),
      location: 'Brooklyn, NY',
      images: JSON.stringify(['https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&q=80&w=600']),
    },
  });

  // 3. Create an Offer (Bob offers his guitar for Alice's camera)
  const offer = await prisma.offer.create({
    data: {
      proposingUserId: user2.id,
      targetListingId: listing1.id,
      status: 'ACCEPTED',
      offeredListings: {
        connect: [{ id: listing2.id }]
      }
    },
  });

  // 4. Create a Trade (since the offer was accepted)
  const trade = await prisma.trade.create({
    data: {
      offerId: offer.id,
      status: 'ACTIVE',
    },
  });

  // 5. Add Messages to Trade
  await prisma.message.create({
    data: {
      tradeId: trade.id,
      senderId: user2.id,
      content: 'Hey Alice, I would love to trade my guitar for your camera!',
    },
  });

  await prisma.message.create({
    data: {
      tradeId: trade.id,
      senderId: user1.id,
      content: 'Hi Bob, that sounds perfect. Let us meet up this weekend.',
    },
  });

  // 6. Create 25 additional listings
  const conditions = ['NEW', 'LIKE_NEW', 'GOOD', 'FAIR', 'POOR'];
  const locations = ['San Francisco, CA', 'Austin, TX', 'Seattle, WA', 'Chicago, IL', 'Miami, FL', 'Denver, CO'];
  
  const additionalListings = [
    { title: 'Bluetooth Speaker', description: 'Portable speaker with great bass.', category: 'Electronics', images: ['https://images.unsplash.com/photo-1608156639585-b3a032ef9689?w=600'] },
    { title: 'Coffee Grinder', description: 'Burr grinder for perfect espresso.', category: 'Home', images: ['https://images.unsplash.com/photo-1559056191-409022283189?w=600'] },
    { title: 'Denim Jacket', description: 'Classic blue denim, size M.', category: 'Clothing', images: ['https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=600'] },
    { title: 'Succulent Trio', description: 'Three healthy succulents in ceramic pots.', category: 'Garden', images: ['https://images.unsplash.com/photo-1446071103084-c257b5f70672?w=600'] },
    { title: 'Star Wars Comic #1', description: 'Mint condition reprint.', category: 'Collectibles', images: ['https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=600'] },
    { title: 'Mechanical Keyboard', description: 'RGB backlit with blue switches.', category: 'Electronics', images: ['https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=600'] },
    { title: 'Cast Iron Skillet', description: 'Pre-seasoned 12-inch skillet.', category: 'Home', images: ['https://images.unsplash.com/photo-1591123120675-6f7f1aae0e5b?w=600'] },
    { title: 'Yoga Mat', description: 'Non-slip rubber mat, 6mm thick.', category: 'Clothing', images: ['https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600'] },
    { title: 'Monstera Plant', description: 'Swiss cheese plant in a 10-inch pot.', category: 'Garden', images: ['https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=600'] },
    { title: 'Noise Cancelling Headphones', description: 'Active noise cancellation, 30hr battery.', category: 'Electronics', images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600'] },
    { title: 'Instant Pot', description: '7-in-1 multi-cooker, 6 quart.', category: 'Home', images: ['https://images.unsplash.com/photo-1585232004423-244e0e6904e3?w=600'] },
    { title: 'Vintage Vinyl Record', description: 'The Beatles - Abbey Road, original press.', category: 'Collectibles', images: ['https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=600'] },
    { title: 'Camping Tent', description: '4-person waterproof tent.', category: 'Garden', images: ['https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600'] },
    { title: 'Electric Toothbrush', description: 'Sonic technology with extra heads.', category: 'Electronics', images: ['https://images.unsplash.com/photo-1553091844-4204b59e3661?w=600'] },
    { title: 'Weighted Blanket', description: '15 lbs for deep sleep.', category: 'Home', images: ['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600'] },
    { title: 'Retro Sunglasses', description: 'Classic aviator style.', category: 'Clothing', images: ['https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600'] },
    { title: 'Digital Camera', description: 'Compact mirrorless camera.', category: 'Electronics', images: ['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600'] },
    { title: 'Board Game Collection', description: 'Settlers of Catan, Ticket to Ride, etc.', category: 'Toys', images: ['https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=600'] },
    { title: 'Espresso Machine', description: 'Manual espresso machine with milk frother.', category: 'Home', images: ['https://images.unsplash.com/photo-1510511233900-1982d92bd835?w=600'] },
    { title: 'Hiking Backpack', description: '50L capacity with rain cover.', category: 'Garden', images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600'] },
    { title: 'Smart Watch', description: 'Fitness tracker with GPS.', category: 'Electronics', images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600'] },
    { title: 'Leather Boots', description: 'Handcrafted brown leather, size 10.', category: 'Clothing', images: ['https://images.unsplash.com/photo-1542281286-9e0a16bb7366?w=600'] },
    { title: 'Bonsai Tree', description: 'Juniper bonsai in a traditional pot.', category: 'Garden', images: ['https://images.unsplash.com/photo-1641412722397-3be359096577?w=600'] },
    { title: 'Rare Stamp Collection', description: 'Over 100 stamps from the 1900s.', category: 'Collectibles', images: ['https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?w=600'] },
    { title: 'Wireless Mouse', description: 'Ergonomic design for long hours.', category: 'Electronics', images: ['https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600'] },
  ];

  for (let i = 0; i < additionalListings.length; i++) {
    const item = additionalListings[i];
    await prisma.listing.create({
      data: {
        userId: i % 2 === 0 ? user1.id : user2.id,
        title: item.title,
        description: item.description,
        category: item.category,
        condition: conditions[i % conditions.length],
        tags: JSON.stringify([item.category.toLowerCase(), 'trade', 'local']),
        location: locations[i % locations.length],
        images: JSON.stringify(item.images),
      },
    });
  }

  console.log('Database seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
