import { useState, useEffect } from "react";
import { Header } from "./components/Header.jsx";
import { Hero } from "./components/Hero.jsx";
import { LessonCard } from "./components/LessonCard.jsx";
import { CourseCard } from "./components/CourseCard.jsx";
import { LevelFilter } from "./components/LevelFilter.jsx";
import { InteractiveLesson } from "./components/InteractiveLesson.jsx";
import { LessonList } from "./components/LessonList.jsx";
import { QuizLesson } from "./components/QuizLesson.jsx";
import { Dashboard } from "./components/Dashboard.jsx";
import { TeacherCard } from "./components/TeacherCard.jsx";
import { ClassSchedule } from "./components/ClassSchedule.jsx";
import { LiveClassroom } from "./components/LiveClassroom.jsx";
import { FlashcardPractice } from "./components/FlashcardPractice.jsx";
import { SpeakingPractice } from "./components/SpeakingPractice.jsx";
import { ListeningPractice } from "./components/ListeningPractice.jsx";
import { GrammarPractice } from "./components/GrammarPractice.jsx";
import { ConversationPractice } from "./components/ConversationPractice.jsx";
import { WritingPractice } from "./components/WritingPractice.jsx";
import { Achievements } from "./components/Achievements.jsx";
import { Forum } from "./components/Forum.jsx";
import { StudyPlan } from "./components/StudyPlan.jsx";
import { AuthModal } from "./components/AuthModal.jsx";
import { Profile } from "./components/Profile.jsx";
import { SubscriptionPlans } from "./components/SubscriptionPlans.jsx";
import { PaymentForm } from "./components/PaymentForm.jsx";
import { PaymentSuccessSubscription } from "./components/PaymentSuccessSubscription.jsx";
import { AdminDashboard } from "./admin/AdminDashboard.jsx";
import { TeacherDashboard } from "./components/TeacherDashboard.jsx";
import { RequestSystem } from "./components/RequestSystem.jsx";
import { DemoContent } from "./components/DemoContent.jsx";
import { AIChatbot } from "./components/AIChatbot.jsx";
import { Card, CardContent } from "./components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Button } from "./components/ui/button";
import { BookOpen, User, Settings, MessageSquare } from "lucide-react";
import { authService } from "./utils/supabase/auth.jsx";
import { toast, Toaster } from "sonner@2.0.3";

// Mock courses with lessons
const MOCK_COURSES = [
  {
    id: "course1",
    name: "English Foundation",
    level: "Beginner",
    description: "Build a strong foundation in English with basic vocabulary, grammar, and conversation skills",
    lessons: [
      { id: "1", title: "Basic Greetings", description: "Learn essential greetings", duration: "15 min", difficulty: "Beginner", courseId: "course1", progress: 100, rating: 4.8, isCompleted: true, isLocked: false },
      { id: "2", title: "Present Tense Verbs", description: "Master present tense", duration: "20 min", difficulty: "Beginner", courseId: "course1", progress: 75, rating: 4.9, isCompleted: false, isLocked: false }
    ]
  },
  {
    id: "course2",
    name: "Pre-Intermediate English",
    level: "Pre-Intermediate",
    description: "Bridge the gap between basic and intermediate English",
    lessons: [
      { id: "5", title: "Past Tense Stories", description: "Learn past tense", duration: "22 min", difficulty: "Beginner", courseId: "course2", progress: 0, rating: 4.7, isCompleted: false, isLocked: false },
      { id: "6", title: "Asking Questions", description: "Master question formation", duration: "18 min", difficulty: "Beginner", courseId: "course2", progress: 0, rating: 4.8, isCompleted: false, isLocked: false }
    ]
  },
  {
    id: "course3",
    name: "Intermediate English",
    level: "Intermediate",
    description: "Advance your English skills with complex grammar",
    lessons: [
      { id: "3", title: "Daily Conversations", description: "Practice daily scenarios", duration: "25 min", difficulty: "Intermediate", courseId: "course3", progress: 30, rating: 4.7, isCompleted: false, isLocked: false },
      { id: "7", title: "Future Plans & Dreams", description: "Express future intentions", duration: "28 min", difficulty: "Intermediate", courseId: "course3", progress: 0, rating: 4.6, isCompleted: false, isLocked: false }
    ]
  },
  {
    id: "course4",
    name: "Advanced English",
    level: "Advanced",
    description: "Master advanced English with business communication",
    lessons: [
      { id: "4", title: "Business English", description: "Professional communication", duration: "30 min", difficulty: "Advanced", courseId: "course4", progress: 0, rating: 4.6, isCompleted: false, isLocked: true },
      { id: "8", title: "Academic Writing", description: "Master formal writing", duration: "35 min", difficulty: "Advanced", courseId: "course4", progress: 0, rating: 4.8, isCompleted: false, isLocked: true }
    ]
  }
];

// Mock quiz questions
const MOCK_QUESTIONS = [
  {
    id: "q1",
    type: "multiple-choice",
    question: "What is the correct way to greet someone formally?",
    options: ["Hey there!", "Good morning", "What's up?", "Yo!"],
    correctAnswer: "Good morning",
    explanation: "Good morning is the most formal and appropriate greeting."
  },
  {
    id: "q2",
    type: "fill-blank",
    question: "Complete: 'I _____ to school every day.'",
    correctAnswer: "go",
    explanation: "The present tense 'go' is correct for habitual actions."
  }
];

export default function App() {
  // View state
  const [currentView, setCurrentView] = useState("home");
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [activeTab, setActiveTab] = useState("lessons");
  const [levelFilter, setLevelFilter] = useState("all");
  
  // Auth state
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Payment state
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [paymentInfo, setPaymentInfo] = useState(null);

  // Chatbot state
  const [showChatbot, setShowChatbot] = useState(false);

  // Load auth on mount
  useEffect(() => {
    const loadAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          const currentUser = authService.getCurrentUser();
          const currentProfile = authService.getCurrentProfile();
          setUser(currentUser);
          setUserProfile(currentProfile);
          
          // Auto-navigate based on role
          if (currentProfile?.userType === 'admin') {
            setCurrentView("admin-dashboard");
          } else if (currentProfile?.userType === 'teacher') {
            setCurrentView("teacher-dashboard");
          }
        }
      } catch (error) {
        console.error('Auth load error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadAuth();
  }, []);

  // Helper: Get user data
  const getUserData = () => {
    if (!userProfile) {
      return {
        id: 'guest',
        name: 'Guest',
        email: '',
        currentLevel: 1,
        totalXP: 0,
        streak: 0,
        enrolledCourses: [],
        hasActiveSubscription: false,
        userType: 'student'
      };
    }
    return {
      id: userProfile.id || 'unknown',
      name: userProfile.fullName || 'User',
      email: userProfile.email || '',
      currentLevel: userProfile.currentLevel || 1,
      totalXP: userProfile.totalXP || 0,
      streak: userProfile.streak || 0,
      enrolledCourses: Array.isArray(userProfile.enrolledCourses) ? userProfile.enrolledCourses : [],
      hasActiveSubscription: userProfile.hasActiveSubscription || false,
      userType: userProfile.userType || 'student'
    };
  };

  const currentUserData = getUserData();

  // Helper: Find lesson by ID
  const findLesson = (lessonId) => {
    for (const course of MOCK_COURSES) {
      const lesson = course.lessons?.find(l => l.id === lessonId);
      if (lesson) return lesson;
    }
    return null;
  };

  // Helper: Check access
  const hasAccess = (lessonId) => {
    if (!user) return false;
    return currentUserData.hasActiveSubscription;
  };

  // Handlers: Lessons
  const handleStartLesson = (lessonId) => {
    const lesson = findLesson(lessonId);
    if (!lesson) {
      toast.error("Không tìm thấy bài học");
      return;
    }
    if (!user) {
      toast.error("Vui lòng đăng nhập");
      setShowAuthModal(true);
      return;
    }
    if (!hasAccess(lessonId)) {
      toast.error("Cần membership để truy cập");
      setCurrentView("subscription-plans");
      return;
    }
    setSelectedLesson(lessonId);
    setCurrentView("lesson");
  };

  const handleLessonComplete = async (score) => {
    if (user && selectedLesson) {
      try {
        const lesson = findLesson(selectedLesson);
        if (lesson) {
          await authService.saveProgress({
            lessonId: selectedLesson,
            courseId: lesson.courseId,
            score,
            timeSpent: 15,
            completed: true
          });
          const updated = await authService.getProfile();
          setUserProfile(updated);
          toast.success("Tiến độ đã lưu!");
        }
      } catch (error) {
        console.error('Save progress error:', error);
        toast.error("Không thể lưu tiến độ");
      }
    }
  };

  // Handlers: Auth
  const handleAuthSuccess = (authUser, profile) => {
    setUser(authUser);
    setUserProfile(profile);
    toast.success(`Chào mừng ${profile.fullName}!`);
    if (profile.userType === 'admin') setCurrentView("admin-dashboard");
    else if (profile.userType === 'teacher') setCurrentView("teacher-dashboard");
  };

  const handleSignOut = async () => {
    try {
      await authService.signOut();
      setUser(null);
      setUserProfile(null);
      setCurrentView("home");
      toast.success("Đã đăng xuất!");
    } catch (error) {
      toast.error("Lỗi đăng xuất");
    }
  };

  // Handlers: Subscription
  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
    setCurrentView("payment");
  };

  const handlePaymentSuccess = async (plan, info) => {
    try {
      await authService.activateSubscription(plan.id);
      for (const course of MOCK_COURSES) {
        await authService.enrollInCourse(course.id);
      }
      const updated = await authService.getProfile();
      setUserProfile(updated);
      setPaymentInfo(info);
      setCurrentView("payment-success");
      toast.success("Đã kích hoạt membership!");
    } catch (error) {
      console.error('Payment error:', error);
      toast.error("Lỗi kích hoạt membership");
    }
  };

  // Loading screen
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
          <p>Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header
        currentLevel={currentUserData.currentLevel}
        totalLevels={10}
        userProgress={(currentUserData.currentLevel - 1) * 10}
        totalXP={currentUserData.totalXP}
        streak={currentUserData.streak}
        isAuthenticated={!!user}
        userName={userProfile?.fullName}
        userAvatar={userProfile?.avatar}
        userType={userProfile?.userType}
        onSignIn={() => setShowAuthModal(true)}
        onSignOut={handleSignOut}
        onProfileClick={() => setCurrentView("profile")}
      />

      {/* Home View */}
      {currentView === "home" && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {!user && <DemoContent onSignUpClick={() => setShowAuthModal(true)} />}
          
          {user && userProfile?.userType === 'student' && (
            <>
              <Hero />
              
              {/* Quick Stats */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-semibold">Chào mừng, {userProfile?.fullName}!</h2>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setCurrentView("requests")}>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Hỗ trợ
                    </Button>
                    <Button variant="outline" onClick={() => setCurrentView("profile")}>
                      <User className="h-4 w-4 mr-2" />
                      Hồ sơ
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-2xl font-bold text-blue-600">{currentUserData.totalXP}</p>
                      <p className="text-sm text-gray-600">Tổng XP</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-2xl font-bold text-orange-600">{currentUserData.streak}</p>
                      <p className="text-sm text-gray-600">Chuỗi ngày học</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-2xl font-bold text-green-600">{currentUserData.currentLevel}</p>
                      <p className="text-sm text-gray-600">Level hiện tại</p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="lessons">Bài học</TabsTrigger>
                  <TabsTrigger value="courses">Khóa học</TabsTrigger>
                  <TabsTrigger value="practice">Luyện tập</TabsTrigger>
                  <TabsTrigger value="dashboard">Thống kê</TabsTrigger>
                </TabsList>

                {/* Lessons Tab */}
                <TabsContent value="lessons" className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-semibold">Bài học của bạn</h2>
                    <LevelFilter selectedLevel={levelFilter} onLevelChange={setLevelFilter} />
                  </div>

                  {currentUserData.hasActiveSubscription ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {MOCK_COURSES.flatMap(c => c.lessons).map(lesson => (
                        <LessonCard key={lesson.id} lesson={lesson} onStart={() => handleStartLesson(lesson.id)} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">Cần membership</h3>
                      <p className="text-gray-600 mb-4">Đăng ký để truy cập toàn bộ bài học</p>
                      <Button onClick={() => setCurrentView("subscription-plans")}>Xem gói membership</Button>
                    </div>
                  )}
                </TabsContent>

                {/* Courses Tab */}
                <TabsContent value="courses" className="space-y-6">
                  <h2 className="text-2xl font-semibold">Tất cả khóa học</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {MOCK_COURSES.map(course => (
                      <CourseCard
                        key={course.id}
                        course={course}
                        isEnrolled={currentUserData.hasActiveSubscription}
                        hasActiveSubscription={currentUserData.hasActiveSubscription}
                        onEnroll={() => setCurrentView("subscription-plans")}
                        onContinue={() => {
                          setSelectedCourse(course.id);
                          setCurrentView("lesson-list");
                        }}
                        onViewLessons={() => {
                          setSelectedCourse(course.id);
                          setCurrentView("lesson-list");
                        }}
                      />
                    ))}
                  </div>
                </TabsContent>

                {/* Practice Tab */}
                <TabsContent value="practice" className="space-y-6">
                  <h2 className="text-2xl font-semibold">Luyện tập kỹ năng</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      { id: "flashcards", title: "Flashcards", icon: "📚" },
                      { id: "speaking", title: "Luyện nói", icon: "🎤" },
                      { id: "listening", title: "Luyện nghe", icon: "🎧" },
                      { id: "writing", title: "Luyện viết", icon: "✍️" },
                      { id: "grammar", title: "Ngữ pháp", icon: "📝" },
                      { id: "conversation", title: "Hội thoại", icon: "💬" }
                    ].map(practice => (
                      <Card key={practice.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setCurrentView(practice.id)}>
                        <CardContent className="p-6 text-center">
                          <div className="text-4xl mb-3">{practice.icon}</div>
                          <h3 className="font-medium">{practice.title}</h3>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                {/* Dashboard Tab */}
                <TabsContent value="dashboard">
                  <Dashboard userStats={currentUserData} />
                </TabsContent>
              </Tabs>
            </>
          )}

          {/* Teacher/Admin Home */}
          {user && (userProfile?.userType === 'teacher' || userProfile?.userType === 'admin') && (
            <div className="text-center py-12">
              <h2 className="text-2xl font-semibold mb-4">Chào mừng, {userProfile?.fullName}!</h2>
              <p className="text-gray-600 mb-6">
                {userProfile?.userType === 'admin' ? 'Truy cập Admin Panel để quản lý hệ thống' : 'Truy cập bảng điều khiển để quản lý khóa học'}
              </p>
              <div className="flex gap-2 justify-center">
                {userProfile?.userType === 'admin' && (
                  <Button onClick={() => setCurrentView("admin-dashboard")}>
                    <Settings className="h-4 w-4 mr-2" />
                    Admin Panel
                  </Button>
                )}
                {userProfile?.userType === 'teacher' && (
                  <Button onClick={() => setCurrentView("teacher-dashboard")}>
                    <BookOpen className="h-4 w-4 mr-2" />
                    Quản lý khóa học
                  </Button>
                )}
                <Button variant="outline" onClick={() => setCurrentView("requests")}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Hỗ trợ
                </Button>
              </div>
            </div>
          )}
        </main>
      )}

      {/* Other Views */}
      {currentView === "lesson-list" && selectedCourse && (
        <LessonList
          course={MOCK_COURSES.find(c => c.id === selectedCourse)}
          onStartLesson={handleStartLesson}
          onStartQuiz={(id) => {
            setSelectedLesson(id);
            setCurrentView("quiz");
          }}
          onBack={() => setCurrentView("home")}
        />
      )}

      {currentView === "lesson" && selectedLesson && (
        <InteractiveLesson
          lesson={findLesson(selectedLesson)}
          questions={MOCK_QUESTIONS}
          onComplete={handleLessonComplete}
          onClose={() => setCurrentView(selectedCourse ? "lesson-list" : "home")}
          nextLessons={MOCK_COURSES.find(c => c.lessons?.some(l => l.id === selectedLesson))?.lessons.filter(l => l.id !== selectedLesson).slice(0, 5) || []}
          onStartLesson={handleStartLesson}
        />
      )}

      {currentView === "quiz" && selectedLesson && (
        <QuizLesson
          lesson={findLesson(selectedLesson)}
          questions={MOCK_QUESTIONS}
          onComplete={(score) => handleLessonComplete(score)}
          onClose={() => setCurrentView(selectedCourse ? "lesson-list" : "home")}
        />
      )}

      {currentView === "profile" && userProfile && (
        <Profile userProfile={userProfile} onProfileUpdate={setUserProfile} onClose={() => setCurrentView("home")} />
      )}

      {currentView === "subscription-plans" && (
        <SubscriptionPlans onBack={() => setCurrentView("home")} onSelectPlan={handleSelectPlan} />
      )}

      {currentView === "payment" && selectedPlan && (
        <PaymentForm plan={selectedPlan} onBack={() => setCurrentView("subscription-plans")} onPaymentSuccess={handlePaymentSuccess} />
      )}

      {currentView === "payment-success" && selectedPlan && paymentInfo && (
        <PaymentSuccessSubscription plan={selectedPlan} paymentInfo={paymentInfo} onStartLearning={() => setCurrentView("home")} onGoHome={() => setCurrentView("home")} />
      )}

      {currentView === "admin-dashboard" && userProfile?.userType === 'admin' && (
        <AdminDashboard onClose={() => setCurrentView("home")} />
      )}

      {currentView === "teacher-dashboard" && userProfile?.userType === 'teacher' && (
        <TeacherDashboard userProfile={userProfile} onClose={() => setCurrentView("home")} />
      )}

      {currentView === "requests" && userProfile && (
        <RequestSystem userProfile={userProfile} onClose={() => setCurrentView("home")} />
      )}

      {/* Practice Views */}
      {currentView === "flashcards" && <FlashcardPractice onClose={() => setCurrentView("home")} />}
      {currentView === "speaking" && <SpeakingPractice onClose={() => setCurrentView("home")} />}
      {currentView === "listening" && <ListeningPractice onClose={() => setCurrentView("home")} />}
      {currentView === "writing" && <WritingPractice onClose={() => setCurrentView("home")} />}
      {currentView === "grammar" && <GrammarPractice onClose={() => setCurrentView("home")} />}
      {currentView === "conversation" && <ConversationPractice onClose={() => setCurrentView("home")} />}

      {/* Modals */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} onAuthSuccess={handleAuthSuccess} />
      <AIChatbot isOpen={showChatbot} onToggle={() => setShowChatbot(!showChatbot)} />
      <Toaster position="top-right" />
    </div>
  );
}
