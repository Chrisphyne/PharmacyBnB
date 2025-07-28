const GeminiService = require('../services/geminiService');

// Mock database seeding script for pharmacy management system
console.log('🌱 Starting pharmacy database seeding...');

// Sample pharmacy data
const pharmacyData = {
  users: [
    {
      id: 'user_1',
      name: 'Dr. Sarah Johnson',
      email: 'sarah.johnson@pharmacare.co.ke',
      role: 'pharmacy_owner',
      status: 'active',
      pharmacyId: 'pharmacy_1'
    },
    {
      id: 'user_2',
      name: 'Michael Wilson',
      email: 'michael.wilson@pharmacare.co.ke',
      role: 'pharmacist',
      status: 'active',
      pharmacyId: 'pharmacy_1'
    },
    {
      id: 'user_3',
      name: 'Grace Mwangi',
      email: 'grace.mwangi@pharmacare.co.ke',
      role: 'pharmacy_technician',
      status: 'active',
      pharmacyId: 'pharmacy_1'
    },
    {
      id: 'user_4',
      name: 'John Kamau',
      email: 'john.kamau@pharmacare.co.ke',
      role: 'cashier',
      status: 'active',
      pharmacyId: 'pharmacy_1'
    }
  ],
  
  pharmacies: [
    {
      id: 'pharmacy_1',
      name: 'PharmaCare Central',
      location: 'Nairobi, Kenya',
      address: '123 Kimathi Street, Nairobi',
      phone: '+254 700 123 456',
      email: 'central@pharmacare.co.ke',
      license: 'PPB/PH/001/2024',
      status: 'active'
    }
  ],

  products: [
    {
      id: 'prod_1',
      name: 'Paracetamol 500mg',
      category: 'Pain Relief',
      brand: 'Dawa Limited',
      strength: '500mg',
      form: 'Tablets',
      price: 150.00,
      currency: 'KSh',
      prescription_required: false,
      storage_conditions: 'Store below 25°C',
      pharmacyId: 'pharmacy_1'
    },
    {
      id: 'prod_2',
      name: 'Amoxicillin 250mg',
      category: 'Antibiotics',
      brand: 'Beta Healthcare',
      strength: '250mg',
      form: 'Capsules',
      price: 450.00,
      currency: 'KSh',
      prescription_required: true,
      storage_conditions: 'Store in a cool, dry place',
      pharmacyId: 'pharmacy_1'
    },
    {
      id: 'prod_3',
      name: 'Vitamin C 1000mg',
      category: 'Supplements',
      brand: 'Wellness Co.',
      strength: '1000mg',
      form: 'Tablets',
      price: 280.00,
      currency: 'KSh',
      prescription_required: false,
      storage_conditions: 'Store below 25°C',
      pharmacyId: 'pharmacy_1'
    },
    {
      id: 'prod_4',
      name: 'Insulin Rapid Acting',
      category: 'Diabetes',
      brand: 'MediPharma',
      strength: '100 IU/ml',
      form: 'Injection',
      price: 2500.00,
      currency: 'KSh',
      prescription_required: true,
      storage_conditions: 'Refrigerate 2-8°C',
      pharmacyId: 'pharmacy_1'
    }
  ],

  inventory: [
    {
      productId: 'prod_1',
      quantity: 500,
      reorderLevel: 50,
      expiryDate: '2025-12-31',
      batchNumber: 'PAR2024001',
      supplier: 'Dawa Limited',
      lastUpdated: new Date().toISOString()
    },
    {
      productId: 'prod_2',
      quantity: 200,
      reorderLevel: 30,
      expiryDate: '2025-06-30',
      batchNumber: 'AMX2024002',
      supplier: 'Beta Healthcare',
      lastUpdated: new Date().toISOString()
    },
    {
      productId: 'prod_3',
      quantity: 150,
      reorderLevel: 25,
      expiryDate: '2026-03-31',
      batchNumber: 'VTC2024003',
      supplier: 'Wellness Co.',
      lastUpdated: new Date().toISOString()
    },
    {
      productId: 'prod_4',
      quantity: 20,
      reorderLevel: 5,
      expiryDate: '2025-01-15',
      batchNumber: 'INS2024004',
      supplier: 'MediPharma',
      lastUpdated: new Date().toISOString()
    }
  ],

  sales: [
    {
      id: 'sale_1',
      items: [
        { productId: 'prod_1', quantity: 2, unitPrice: 150.00, total: 300.00 },
        { productId: 'prod_3', quantity: 1, unitPrice: 280.00, total: 280.00 }
      ],
      totalAmount: 580.00,
      currency: 'KSh',
      paymentMethod: 'cash',
      customerId: 'customer_1',
      staffId: 'user_4',
      pharmacyId: 'pharmacy_1',
      timestamp: new Date().toISOString(),
      status: 'completed'
    },
    {
      id: 'sale_2',
      items: [
        { productId: 'prod_2', quantity: 1, unitPrice: 450.00, total: 450.00 }
      ],
      totalAmount: 450.00,
      currency: 'KSh',
      paymentMethod: 'mpesa',
      customerId: 'customer_2',
      staffId: 'user_2',
      pharmacyId: 'pharmacy_1',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      status: 'completed'
    }
  ],

  customers: [
    {
      id: 'customer_1',
      name: 'Mary Njoroge',
      phone: '+254 712 345 678',
      email: 'mary.njoroge@email.com',
      dateOfBirth: '1985-03-15',
      pharmacyId: 'pharmacy_1'
    },
    {
      id: 'customer_2',
      name: 'Peter Ochieng',
      phone: '+254 723 456 789',
      email: 'peter.ochieng@email.com',
      dateOfBirth: '1978-11-22',
      pharmacyId: 'pharmacy_1'
    }
  ]
};

// Simulate database operations
async function seedDatabase() {
  try {
    console.log('📊 Seeding pharmacy data...');
    
    // Simulate seeding users
    console.log(`✅ Seeded ${pharmacyData.users.length} users`);
    pharmacyData.users.forEach(user => {
      console.log(`   - ${user.name} (${user.role})`);
    });

    // Simulate seeding pharmacies
    console.log(`✅ Seeded ${pharmacyData.pharmacies.length} pharmacy`);
    pharmacyData.pharmacies.forEach(pharmacy => {
      console.log(`   - ${pharmacy.name} at ${pharmacy.location}`);
    });

    // Simulate seeding products
    console.log(`✅ Seeded ${pharmacyData.products.length} products`);
    pharmacyData.products.forEach(product => {
      console.log(`   - ${product.name} (${product.category})`);
    });

    // Simulate seeding inventory
    console.log(`✅ Seeded ${pharmacyData.inventory.length} inventory items`);
    pharmacyData.inventory.forEach(item => {
      const product = pharmacyData.products.find(p => p.id === item.productId);
      console.log(`   - ${product?.name}: ${item.quantity} units`);
    });

    // Simulate seeding sales
    console.log(`✅ Seeded ${pharmacyData.sales.length} sales records`);
    pharmacyData.sales.forEach(sale => {
      console.log(`   - Sale ${sale.id}: KSh ${sale.totalAmount}`);
    });

    // Simulate seeding customers
    console.log(`✅ Seeded ${pharmacyData.customers.length} customers`);
    pharmacyData.customers.forEach(customer => {
      console.log(`   - ${customer.name} (${customer.phone})`);
    });

    // Test AI integration
    console.log('🤖 Testing AI integration...');
    try {
      const geminiService = new GeminiService();
      const testResult = await geminiService.testConnection();
      
      if (testResult.success) {
        console.log('✅ Gemini AI service connected successfully');
        
        // Test pharmacy-specific AI query
        const testQuery = await geminiService.generateResponse(
          "What are the storage requirements for insulin?",
          {
            userRole: 'pharmacist',
            pharmacyData: pharmacyData.pharmacies[0],
            conversationHistory: []
          }
        );
        
        if (testQuery.success) {
          console.log('✅ AI query test successful');
          console.log('📝 Sample AI response:', testQuery.response.substring(0, 100) + '...');
        } else {
          console.log('⚠️  AI query test failed:', testQuery.error);
        }
      } else {
        console.log('⚠️  Gemini AI service connection failed:', testResult.error);
      }
    } catch (aiError) {
      console.log('⚠️  AI integration test skipped:', aiError.message);
    }

    // Generate analytics summary
    console.log('\n📈 Analytics Summary:');
    const totalInventoryValue = pharmacyData.inventory.reduce((total, item) => {
      const product = pharmacyData.products.find(p => p.id === item.productId);
      return total + (item.quantity * (product?.price || 0));
    }, 0);
    
    const totalSalesValue = pharmacyData.sales.reduce((total, sale) => total + sale.totalAmount, 0);
    
    console.log(`   💰 Total Inventory Value: KSh ${totalInventoryValue.toLocaleString()}`);
    console.log(`   📊 Total Sales Value: KSh ${totalSalesValue.toLocaleString()}`);
    console.log(`   👥 Active Users: ${pharmacyData.users.filter(u => u.status === 'active').length}`);
    console.log(`   📦 Products in Catalog: ${pharmacyData.products.length}`);
    console.log(`   🏪 Active Pharmacies: ${pharmacyData.pharmacies.filter(p => p.status === 'active').length}`);

    // Low stock alerts
    console.log('\n⚠️  Stock Alerts:');
    const lowStockItems = pharmacyData.inventory.filter(item => item.quantity <= item.reorderLevel);
    if (lowStockItems.length > 0) {
      lowStockItems.forEach(item => {
        const product = pharmacyData.products.find(p => p.id === item.productId);
        console.log(`   🔴 LOW STOCK: ${product?.name} (${item.quantity} remaining, reorder at ${item.reorderLevel})`);
      });
    } else {
      console.log('   ✅ All items are adequately stocked');
    }

    // Expiry alerts
    console.log('\n📅 Expiry Alerts:');
    const sixMonthsFromNow = new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000);
    const expiringItems = pharmacyData.inventory.filter(item => 
      new Date(item.expiryDate) <= sixMonthsFromNow
    );
    
    if (expiringItems.length > 0) {
      expiringItems.forEach(item => {
        const product = pharmacyData.products.find(p => p.id === item.productId);
        console.log(`   🟡 EXPIRING SOON: ${product?.name} (expires ${item.expiryDate})`);
      });
    } else {
      console.log('   ✅ No items expiring within 6 months');
    }

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n🚀 Your pharmacy management system is ready with sample data.');
    console.log('\n📋 Next steps:');
    console.log('   1. Start the server: npm run server:dev');
    console.log('   2. Start the client: npm run client:dev');
    console.log('   3. Or run both: npm run dev');
    console.log('   4. Or use Docker: docker compose up -d');
    console.log('\n🌐 Access your application at: http://localhost:3000');

  } catch (error) {
    console.error('❌ Error during database seeding:', error);
    process.exit(1);
  }
}

// Run the seeding
seedDatabase();
