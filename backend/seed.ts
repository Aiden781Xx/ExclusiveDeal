import mongoose from 'mongoose';
import Deal from './src/models/Deal.js';
import dotenv from 'dotenv';

dotenv.config();

const seedDeals = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/startup-benefits');
    console.log('✓ Connected to MongoDB');

    // Clear existing deals
    await Deal.deleteMany({});
    console.log('✓ Cleared existing deals');

    const deals = [
      // Cloud Services
      {
        title: 'AWS Startup Credit',
        description: 'Get $5,000 in AWS credits to build and scale your startup on AWS. Includes free resources like EC2, S3, Lambda, and more.',
        category: 'Cloud',
        partner: {
          name: 'Amazon Web Services',
          website: 'https://aws.amazon.com',
        },
        discount: 60,
        originalPrice: '$5000',
        discountedPrice: '$2000',
        status: 'active',
        isLocked: false,
        requiredVerification: 'none',
        claimsCount: 0,
        features: ['EC2 Instances', 'S3 Storage', 'Lambda Functions', 'RDS Database'],
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
      {
        title: 'Google Cloud Startup Credits',
        description: 'Access $3,000 in Google Cloud credits for compute, storage, and analytics services. Perfect for building scalable applications.',
        category: 'Cloud',
        partner: {
          name: 'Google Cloud',
          website: 'https://cloud.google.com',
        },
        discount: 50,
        originalPrice: '$3000',
        discountedPrice: '$1500',
        status: 'active',
        isLocked: true,
        requiredVerification: 'basic',
        claimsCount: 0,
        features: ['Compute Engine', 'Cloud Storage', 'BigQuery', 'Cloud SQL'],
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
      {
        title: 'Azure for Startups',
        description: 'Claim $10,000 in Azure credits for the first year. Includes virtual machines, databases, and AI services.',
        category: 'Cloud',
        partner: {
          name: 'Microsoft Azure',
          website: 'https://azure.microsoft.com',
        },
        discount: 70,
        originalPrice: '$10000',
        discountedPrice: '$3000',
        status: 'active',
        isLocked: true,
        requiredVerification: 'detailed',
        claimsCount: 0,
        features: ['Virtual Machines', 'SQL Database', 'App Service', 'Azure AI'],
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
      {
        title: 'Heroku Free Dyno Hours',
        description: 'Get 1000 free dyno hours monthly with Heroku. Perfect for deploying and scaling web applications.',
        category: 'Cloud',
        partner: {
          name: 'Heroku',
          website: 'https://heroku.com',
        },
        discount: 100,
        originalPrice: '$2000',
        discountedPrice: 'Free',
        status: 'active',
        isLocked: false,
        requiredVerification: 'none',
        claimsCount: 0,
        features: ['Free Dyno Hours', 'Add-ons', 'Dynos', 'PostgreSQL'],
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },

      // Marketing Tools
      {
        title: 'HubSpot CRM + Marketing',
        description: 'Free HubSpot CRM with marketing automation tools for 1 year. Manage customer relationships and automate your marketing.',
        category: 'Marketing',
        partner: {
          name: 'HubSpot',
          website: 'https://hubspot.com',
        },
        discount: 80,
        originalPrice: '$8000',
        discountedPrice: '$1600',
        status: 'active',
        isLocked: false,
        requiredVerification: 'none',
        claimsCount: 0,
        features: ['CRM', 'Email Marketing', 'Landing Pages', 'Lead Scoring'],
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
      {
        title: 'Mailchimp Email Marketing',
        description: '50% discount on Mailchimp Pro for 12 months. Create and send beautiful email campaigns to grow your audience.',
        category: 'Marketing',
        partner: {
          name: 'Mailchimp',
          website: 'https://mailchimp.com',
        },
        discount: 50,
        originalPrice: '$1500',
        discountedPrice: '$750',
        status: 'active',
        isLocked: false,
        requiredVerification: 'none',
        claimsCount: 0,
        features: ['Email Campaigns', 'Automation', 'A/B Testing', 'Analytics'],
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
      {
        title: 'Canva Pro for Teams',
        description: 'Free Canva Pro team account for 6 months. Create stunning graphics, presentations, and videos.',
        category: 'Marketing',
        partner: {
          name: 'Canva',
          website: 'https://canva.com',
        },
        discount: 60,
        originalPrice: '$600',
        discountedPrice: '$240',
        status: 'active',
        isLocked: true,
        requiredVerification: 'basic',
        claimsCount: 0,
        features: ['Design Templates', 'Team Collaboration', 'Brand Kit', 'Video Editor'],
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
      {
        title: 'Buffer Social Media Management',
        description: '40% off Buffer Pro for 1 year. Schedule posts, manage multiple channels, and measure social media ROI.',
        category: 'Marketing',
        partner: {
          name: 'Buffer',
          website: 'https://buffer.com',
        },
        discount: 40,
        originalPrice: '$2000',
        discountedPrice: '$1200',
        status: 'active',
        isLocked: false,
        requiredVerification: 'none',
        claimsCount: 0,
        features: ['Social Scheduling', 'Analytics', 'Team Collaboration', 'Content Library'],
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },

      // Analytics Tools
      {
        title: 'Mixpanel Product Analytics',
        description: 'Free Mixpanel Growth plan for 1 year. Understand user behavior and optimize your product with advanced analytics.',
        category: 'Analytics',
        partner: {
          name: 'Mixpanel',
          website: 'https://mixpanel.com',
        },
        discount: 90,
        originalPrice: '$5000',
        discountedPrice: '$500',
        status: 'active',
        isLocked: true,
        requiredVerification: 'detailed',
        claimsCount: 0,
        features: ['Event Analytics', 'User Segmentation', 'Funnel Analysis', 'Retention Analytics'],
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
      {
        title: 'Amplitude User Analytics',
        description: '50% discount on Amplitude for 12 months. Track user behavior and improve product engagement.',
        category: 'Analytics',
        partner: {
          name: 'Amplitude',
          website: 'https://amplitude.com',
        },
        discount: 50,
        originalPrice: '$3500',
        discountedPrice: '$1750',
        status: 'active',
        isLocked: true,
        requiredVerification: 'basic',
        claimsCount: 0,
        features: ['User Behavior', 'Cohort Analysis', 'Journey Analytics', 'Dashboards'],
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
      {
        title: 'Google Analytics 4',
        description: 'Premium Google Analytics 4 setup with Firebase integration. Monitor and analyze your web and app data.',
        category: 'Analytics',
        partner: {
          name: 'Google Analytics',
          website: 'https://google.com/analytics',
        },
        discount: 100,
        originalPrice: 'Free',
        discountedPrice: 'Free',
        status: 'active',
        isLocked: false,
        requiredVerification: 'none',
        claimsCount: 0,
        features: ['Web Analytics', 'App Analytics', 'Real-time Reporting', 'Custom Events'],
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
      {
        title: 'Segment Customer Data',
        description: 'Free Segment Business Tier for 6 months. Collect, manage, and activate all your customer data.',
        category: 'Analytics',
        partner: {
          name: 'Segment',
          website: 'https://segment.com',
        },
        discount: 75,
        originalPrice: '$4000',
        discountedPrice: '$1000',
        status: 'active',
        isLocked: false,
        requiredVerification: 'none',
        claimsCount: 0,
        features: ['Data Collection', 'Data Warehouse', 'Real-time Sync', 'Audience Builder'],
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },

      // Productivity Tools
      {
        title: 'Slack Pro Workspace',
        description: 'Free Slack Pro workspace for 1 year (up to 10,000 members). Collaborate and communicate with your team seamlessly.',
        category: 'Productivity',
        partner: {
          name: 'Slack',
          website: 'https://slack.com',
        },
        discount: 85,
        originalPrice: '$8000',
        discountedPrice: '$1200',
        status: 'active',
        isLocked: true,
        requiredVerification: 'basic',
        claimsCount: 0,
        features: ['Unlimited Messages', 'Integrations', 'Workflow Builder', 'File Storage'],
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
      {
        title: 'Notion Team Workspace',
        description: 'Free Notion Team plan for 1 year. Build your knowledge base, wiki, and project management all in one place.',
        category: 'Productivity',
        partner: {
          name: 'Notion',
          website: 'https://notion.so',
        },
        discount: 100,
        originalPrice: 'Free',
        discountedPrice: 'Free',
        status: 'active',
        isLocked: false,
        requiredVerification: 'none',
        claimsCount: 0,
        features: ['Databases', 'Wiki', 'Project Management', 'Team Collaboration'],
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
      {
        title: 'Asana Project Management',
        description: '50% off Asana Premium for 12 months. Manage projects, tasks, and team workflows efficiently.',
        category: 'Productivity',
        partner: {
          name: 'Asana',
          website: 'https://asana.com',
        },
        discount: 50,
        originalPrice: '$2500',
        discountedPrice: '$1250',
        status: 'active',
        isLocked: false,
        requiredVerification: 'none',
        claimsCount: 0,
        features: ['Task Management', 'Timeline View', 'Dependencies', 'Custom Fields'],
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
      {
        title: 'Monday.com Workspace',
        description: 'Free Monday.com Pro plan for 6 months. Streamline your work with intuitive project management tools.',
        category: 'Productivity',
        partner: {
          name: 'Monday.com',
          website: 'https://monday.com',
        },
        discount: 60,
        originalPrice: '$3000',
        discountedPrice: '$1200',
        status: 'active',
        isLocked: true,
        requiredVerification: 'detailed',
        claimsCount: 0,
        features: ['Workflow Automation', 'Templates', 'Integrations', 'Reporting'],
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
      {
        title: 'Zoom Pro Meeting',
        description: 'Free Zoom Pro (500 participants) for 12 months. Host unlimited meetings with advanced features.',
        category: 'Productivity',
        partner: {
          name: 'Zoom',
          website: 'https://zoom.us',
        },
        discount: 70,
        originalPrice: '$1800',
        discountedPrice: '$540',
        status: 'active',
        isLocked: false,
        requiredVerification: 'none',
        claimsCount: 0,
        features: ['Unlimited Meetings', '500 Participants', 'Screen Share', 'Recording'],
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
    ];

    const createdDeals = await Deal.insertMany(deals);
    console.log(`✓ Created ${createdDeals.length} test deals`);

    // Print summary
    console.log('\n📊 Deal Summary:');
    const categories = ['cloud', 'marketing', 'analytics', 'productivity'];
    for (const cat of categories) {
      const count = createdDeals.filter(d => d.category === cat).length;
      console.log(`  ${cat.toUpperCase()}: ${count} deals`);
    }

    const lockedCount = createdDeals.filter(d => d.isLocked).length;
    const publicCount = createdDeals.filter(d => !d.isLocked).length;
    console.log(`  LOCKED: ${lockedCount} deals`);
    console.log(`  PUBLIC: ${publicCount} deals`);

    console.log('\n✓ Database seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
};

seedDeals();
