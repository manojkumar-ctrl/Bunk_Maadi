import React from 'react';

const Guide = () => {
  const features = [
    {
      title: "Calculate Bunkable Classes",
      description:
        "Know exactly how many classes you can safely bunk based on your current attendance and subject-wise data.",
      icon: "🧮"
    },
    {
      title: "Track Subject-wise Bunked Classes",
      description:
        "Keep a detailed log of how many classes you’ve bunked per subject — saved securely if logged in.",
      icon: "📚"
    },
    {
      title: "Calendar Integration",
      description:
        "Mark absent days directly into your calendar to stay organized and visualize your attendance patterns.",
      icon: "📅"
    },
    {
      title: "Bunk Smart",
      description:
        "Get intelligent suggestions on whether it's safe to skip the next class without risking your attendance.",
      icon: "🤖"
    }
  ];

  return (
    <section className="py-16 px-4 bg-gray-900 text-white bg-slate-200">
      <div className=" max-w-6xl mx-auto text-center bg-slate-200">
        <h2 className="text-3xl md:text-4xl font-bold mb-12 text-black">
          What Can You Expect Here?
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-blue-900 p-6 rounded-lg shadow-lg flex flex-col items-center transform transition duration-300 hover:scale-105 hover:bg-blue-900"
            >
              <div className="text-5xl mb-4" role="img" aria-label={feature.title}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-gray-300 text-center">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Guide;
