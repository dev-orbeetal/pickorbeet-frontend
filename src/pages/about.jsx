import { motion } from 'framer-motion';
import { Award, Users, Heart, Truck } from 'lucide-react';
import Layout from '@/components/layout/Layout';

export default function AboutPage() {
  const stats = [
    { icon: Users, value: '10,000+', label: 'Happy Customers' },
    { icon: Award, value: '5+', label: 'Years Experience' },
    { icon: Heart, value: '50,000+', label: 'Products Sold' },
    { icon: Truck, value: '64', label: 'Districts Covered' },
  ];

  return (
    <Layout title="About Us - Zzuhana">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl"
          >
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-6">
              About Zzuhana
            </h1>
            <p className="text-xl text-primary-100 leading-relaxed">
              We're on a mission to make premium fashion accessible to everyone in Bangladesh.
              Quality clothing, exceptional service, and unbeatable style.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 text-primary-600 rounded-2xl mb-4">
                  <stat.icon className="w-8 h-8" />
                </div>
                <p className="text-3xl font-bold text-secondary-900">{stat.value}</p>
                <p className="text-secondary-600">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 bg-gray-50">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-display font-bold text-secondary-900 mb-6">
                Our Story
              </h2>
              <div className="space-y-4 text-secondary-600 leading-relaxed">
                <p>
                  Founded in 2019, Zzuhana started as a small boutique in Dhaka with a simple vision: 
                  to bring premium quality clothing to the Bangladeshi market at affordable prices.
                </p>
                <p>
                  What began as a passion project has grown into one of the most trusted fashion 
                  destinations in Bangladesh. We carefully curate our collections, ensuring every 
                  piece meets our high standards for quality, comfort, and style.
                </p>
                <p>
                  Today, we serve customers across all 64 districts of Bangladesh, offering fast 
                  delivery, secure payment options, and exceptional customer service. Our commitment 
                  to quality and customer satisfaction remains at the heart of everything we do.
                </p>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="aspect-square rounded-2xl overflow-hidden bg-gray-200">
                <img
                  src="/images/about/store.jpg"
                  alt="Zzuhana Store"
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-display font-bold text-secondary-900 mb-4">
              Our Values
            </h2>
            <p className="text-secondary-600 max-w-2xl mx-auto">
              These principles guide everything we do at Zzuhana
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Quality First',
                description: 'We never compromise on quality. Every product is carefully selected and inspected before reaching you.',
              },
              {
                title: 'Customer Focused',
                description: 'Your satisfaction is our priority. We go above and beyond to ensure you have the best shopping experience.',
              },
              {
                title: 'Sustainable Fashion',
                description: 'We believe in responsible fashion. We work with ethical suppliers and promote sustainable practices.',
              },
            ].map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-50 rounded-2xl p-8 text-center"
              >
                <h3 className="text-xl font-semibold text-secondary-900 mb-4">
                  {value.title}
                </h3>
                <p className="text-secondary-600">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
