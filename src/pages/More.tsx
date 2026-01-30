import { motion } from 'framer-motion';
import { Award, Users, Activity, Calendar, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { MobileNav } from '@/components/MobileNav';

const highlights = [
  {
    icon: Award,
    title: 'Academic Excellence',
    description: 'Nurturing young minds with quality education and holistic development.',
  },
  {
    icon: Users,
    title: 'House System',
    description: 'Building teamwork and healthy competition through our vibrant house system.',
  },
  {
    icon: Activity,
    title: 'Co-Curricular Activities',
    description: 'Comprehensive CCA programs to develop well-rounded personalities.',
  },
  {
    icon: Calendar,
    title: 'Kalotsav',
    description: 'Our annual arts festival celebrating creativity and cultural heritage.',
  },
];

const exploreItems = [
  { title: 'Results', description: 'View competition results', icon: Award },
  { title: 'Houses', description: 'Our house system', icon: Users },
  { title: 'CCA', description: 'Co-curricular activities', icon: Activity },
  { title: 'Kalotsav', description: 'Arts festival', icon: Calendar },
];

const More = () => {
  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />

      <section className="py-12 px-4 bg-background pt-24">
        <div className="container mx-auto max-w-7xl">
          {/* Back Button */}
          <div className="mb-8">
            <Link 
              to="/"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </div>

          {/* What Makes Us Special */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="text-gradient-gold">What Makes Us</span>{' '}
              <span className="text-foreground">Special</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
            {highlights.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group relative"
              >
                <div className="glass-card rounded-xl p-6 h-full border border-border/50 hover:border-primary/50 transition-all duration-300">
                  <div className="w-14 h-14 rounded-lg bg-primary/20 flex items-center justify-center mb-4 group-hover:bg-primary/30 transition-colors">
                    <item.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2 font-sans">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Explore Our School */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold">
              <span className="text-foreground">Explore Our</span>{' '}
              <span className="text-gradient-gold">School</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {exploreItems.map((item, index) => (
              <motion.a
                key={item.title}
                href="https://mescampusschool.gt.tc"
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02 }}
                className="group"
              >
                <div className="glass-card rounded-xl p-6 md:p-8 text-center border border-border/50 hover:border-primary/50 transition-all duration-300 h-full">
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/30 transition-colors">
                    <item.icon className="w-6 h-6 md:w-8 md:h-8 text-primary" />
                  </div>
                  <h3 className="text-lg md:text-xl font-semibold text-foreground mb-1 font-sans">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground text-xs md:text-sm">
                    {item.description}
                  </p>
                </div>
              </motion.a>
            ))}
          </div>

          {/* About Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mt-24 glass-card rounded-2xl p-8 md:p-12 border border-border/50"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center">
              About <span className="text-gradient-gold">MES Campus School</span>
            </h2>
            <div className="max-w-4xl mx-auto space-y-4 text-muted-foreground leading-relaxed text-center">
              <p>
                MES Campus School, Kuttippuram is a premier educational institution under the Muslim Educational Society, 
                committed to providing quality education that combines academic excellence with character building. 
                Our school nurtures young minds to become responsible citizens who contribute positively to society.
              </p>
              <p>
                With a focus on holistic development, we offer a comprehensive curriculum complemented by various 
                co-curricular activities, sports, and cultural programs. Our dedicated faculty and modern facilities 
                create an ideal learning environment for students to thrive and excel.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mt-10">
              <div className="text-center p-6 rounded-xl bg-card/50">
                <h3 className="text-xl font-bold text-primary mb-2">Our Vision</h3>
                <p className="text-sm text-muted-foreground">
                  Moulding an ideal generation with academic excellence who believes in the values of morality, respect and responsibility.
                </p>
              </div>
              <div className="text-center p-6 rounded-xl bg-card/50">
                <h3 className="text-xl font-bold text-primary mb-2">Our Mission</h3>
                <p className="text-sm text-muted-foreground">
                  To educate, prepare and inspire the students to achieve their full potential as life long learners, thinkers and productive citizens.
                </p>
              </div>
              <div className="text-center p-6 rounded-xl bg-card/50">
                <h3 className="text-xl font-bold text-primary mb-2">Our Values</h3>
                <p className="text-sm text-muted-foreground">
                  Excellence, integrity, respect, responsibility, and commitment to continuous learning and growth.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
      <MobileNav />
    </div>
  );
};

export default More;
