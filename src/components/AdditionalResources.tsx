'use client'
import { useTranslations } from 'next-intl';
import { FaGraduationCap, FaBook, FaLaptop, FaMoneyBillWave, FaFileAlt } from 'react-icons/fa';
import Link from 'next/link';

const AdditionalResources = () => {
  const t = useTranslations('additionalResources');

  const resources = [
    {
      id: 'test-prep',
      icon: <FaGraduationCap className="text-primary text-4xl mb-4" />,
      title: t('testPrep'),
      description: t('testPrepDescription'),
      links: [
        { name: 'Khan Academy SAT', url: 'https://www.khanacademy.org/SAT' },
        { name: 'College Board', url: 'https://www.collegeboard.org/' },
        { name: 'ACT Test Prep', url: 'https://www.act.org/content/act/en/products-and-services/the-act/test-preparation.html' }
      ]
    },
    {
      id: 'scholarships',
      icon: <FaMoneyBillWave className="text-primary text-4xl mb-4" />,
      title: t('scholarships'),
      description: t('scholarshipsDescription'),
      links: [
        { name: 'Fastweb', url: 'https://www.fastweb.com/' },
        { name: 'Scholarships.com', url: 'https://www.scholarships.com/' },
        { name: 'Federal Student Aid', url: 'https://studentaid.gov/' }
      ]
    },
    {
      id: 'online-courses',
      icon: <FaLaptop className="text-primary text-4xl mb-4" />,
      title: t('onlineCourses'),
      description: t('onlineCoursesDescription'),
      links: [
        { name: 'Coursera', url: 'https://www.coursera.org/' },
        { name: 'edX', url: 'https://www.edx.org/' },
        { name: 'Khan Academy', url: 'https://www.khanacademy.org/' }
      ]
    },
    {
      id: 'college-applications',
      icon: <FaFileAlt className="text-primary text-4xl mb-4" />,
      title: t('collegeApplications'),
      description: t('collegeApplicationsDescription'),
      links: [
        { name: 'Common Application', url: 'https://www.commonapp.org/' },
        { name: 'Coalition Application', url: 'https://www.coalitionforcollegeaccess.org/' },
        { name: 'College Essay Guy', url: 'https://www.collegeessayguy.com/' }
      ]
    }
  ];

  return (
    <div id="additional-resources" className="min-h-screen px-4 py-16 max-w-6xl mx-auto scroll-mt-28">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-2">{t('title')}</h2>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">{t('subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {resources.map((resource) => (
          <div 
            key={resource.id} 
            className="bg-white rounded-xl shadow-lg p-6 transition-transform duration-300 hover:scale-[1.02] hover:shadow-xl"
          >
            <div className="flex flex-col items-center text-center mb-4">
              {resource.icon}
              <h3 className="text-xl font-semibold mb-2">{resource.title}</h3>
              <p className="text-gray-600 mb-4">{resource.description}</p>
            </div>
            
            <div className="border-t border-gray-200 pt-4">
              <h4 className="font-medium mb-2">{t('recommendedResources')}:</h4>
              <ul className="space-y-2">
                {resource.links.map((link, index) => (
                  <li key={index}>
                    <Link 
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary-dark transition-colors flex items-center"
                    >
                      <FaBook className="mr-2" /> {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 bg-gray-50 rounded-xl p-6 border border-gray-200">
        <h3 className="text-xl font-semibold mb-4">{t('additionalTips')}</h3>
        <ul className="space-y-3 list-disc pl-5">
          <li>{t('tipEarly')}</li>
          <li>{t('tipResearch')}</li>
          <li>{t('tipVisit')}</li>
          <li>{t('tipMentors')}</li>
        </ul>
      </div>
    </div>
  );
};

export default AdditionalResources;
