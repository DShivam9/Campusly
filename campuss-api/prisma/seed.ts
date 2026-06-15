import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Campusly database...');

  // Clean up existing data (order matters due to relations)
  await prisma.eventRegistration.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.serviceRequest.deleteMany();
  await prisma.marketplaceListing.deleteMany();
  await prisma.busLocation.deleteMany();
  await prisma.bus.deleteMany();
  await prisma.busRoute.deleteMany();
  await prisma.grade.deleteMany();
  await prisma.attendanceRecord.deleteMany();
  await prisma.timetableEntry.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.feeRecord.deleteMany();
  await prisma.libraryBook.deleteMany();
  await prisma.event.deleteMany();
  await prisma.course.deleteMany();
  await prisma.user.deleteMany();

  const hash = (pw: string) => bcrypt.hashSync(pw, 10);

  // ── Users ──────────────────────────────────────────
  const admin = await prisma.user.create({
    data: { email: 'admin@campusly.edu', passwordHash: hash('admin123'), fullName: 'Dr. Rajesh Khanna', role: 'admin', department: 'Administration', phone: '+91-9800000001' },
  });
  const admin2 = await prisma.user.create({
    data: { email: 'registrar@campusly.edu', passwordHash: hash('admin123'), fullName: 'Mrs. Sunita Mehta', role: 'admin', department: 'Registrar Office', phone: '+91-9800000002' },
  });

  const faculty1 = await prisma.user.create({
    data: { email: 'prof.sharma@campusly.edu', passwordHash: hash('faculty123'), fullName: 'Prof. Anil Sharma', role: 'faculty', department: 'Computer Science', phone: '+91-9876543210' },
  });
  const faculty2 = await prisma.user.create({
    data: { email: 'prof.patel@campusly.edu', passwordHash: hash('faculty123'), fullName: 'Prof. Meera Patel', role: 'faculty', department: 'Electrical Engineering', phone: '+91-9876543211' },
  });
  const faculty3 = await prisma.user.create({
    data: { email: 'prof.kumar@campusly.edu', passwordHash: hash('faculty123'), fullName: 'Prof. Sanjay Kumar', role: 'faculty', department: 'Mathematics', phone: '+91-9876543212' },
  });

  const student1 = await prisma.user.create({
    data: { email: 'rahul@campusly.edu', passwordHash: hash('student123'), fullName: 'Rahul Verma', role: 'student', department: 'Computer Science', enrollmentYear: 2023, phone: '+91-9123456780' },
  });
  const student2 = await prisma.user.create({
    data: { email: 'priya@campusly.edu', passwordHash: hash('student123'), fullName: 'Priya Singh', role: 'student', department: 'Computer Science', enrollmentYear: 2023, phone: '+91-9123456781' },
  });
  const student3 = await prisma.user.create({
    data: { email: 'amit@campusly.edu', passwordHash: hash('student123'), fullName: 'Amit Gupta', role: 'student', department: 'Electrical Engineering', enrollmentYear: 2022, phone: '+91-9123456782' },
  });
  const student4 = await prisma.user.create({
    data: { email: 'neha@campusly.edu', passwordHash: hash('student123'), fullName: 'Neha Joshi', role: 'student', department: 'Mathematics', enrollmentYear: 2024, phone: '+91-9123456783' },
  });
  const student5 = await prisma.user.create({
    data: { email: 'vikram@campusly.edu', passwordHash: hash('student123'), fullName: 'Vikram Rathore', role: 'student', department: 'Computer Science', enrollmentYear: 2023, phone: '+91-9123456784' },
  });

  const alumni1 = await prisma.user.create({
    data: { email: 'anita.alumni@campusly.edu', passwordHash: hash('alumni123'), fullName: 'Anita Desai', role: 'alumni', department: 'Computer Science', enrollmentYear: 2018, phone: '+91-9234567890' },
  });
  const alumni2 = await prisma.user.create({
    data: { email: 'raj.alumni@campusly.edu', passwordHash: hash('alumni123'), fullName: 'Raj Malhotra', role: 'alumni', department: 'Electrical Engineering', enrollmentYear: 2019, phone: '+91-9234567891' },
  });

  console.log('  ✅ Users created (2 admins, 3 faculty, 5 students, 2 alumni)');

  // ── Courses ────────────────────────────────────────
  const cs101 = await prisma.course.create({
    data: { code: 'CS101', name: 'Introduction to Programming', facultyId: faculty1.id, department: 'Computer Science', credits: 4, semester: 1, academicYear: '2025-26' },
  });
  const cs201 = await prisma.course.create({
    data: { code: 'CS201', name: 'Data Structures & Algorithms', facultyId: faculty1.id, department: 'Computer Science', credits: 4, semester: 3, academicYear: '2025-26' },
  });
  const cs301 = await prisma.course.create({
    data: { code: 'CS301', name: 'Database Systems', facultyId: faculty1.id, department: 'Computer Science', credits: 4, semester: 5, academicYear: '2025-26' },
  });
  const ee101 = await prisma.course.create({
    data: { code: 'EE101', name: 'Circuit Theory', facultyId: faculty2.id, department: 'Electrical Engineering', credits: 3, semester: 1, academicYear: '2025-26' },
  });
  const ee201 = await prisma.course.create({
    data: { code: 'EE201', name: 'Digital Electronics', facultyId: faculty2.id, department: 'Electrical Engineering', credits: 3, semester: 3, academicYear: '2025-26' },
  });
  const ma201 = await prisma.course.create({
    data: { code: 'MA201', name: 'Linear Algebra', facultyId: faculty3.id, department: 'Mathematics', credits: 3, semester: 3, academicYear: '2025-26' },
  });
  const ma101 = await prisma.course.create({
    data: { code: 'MA101', name: 'Calculus I', facultyId: faculty3.id, department: 'Mathematics', credits: 4, semester: 1, academicYear: '2025-26' },
  });

  console.log('  ✅ 7 courses created');

  // ── Enrollments ────────────────────────────────────
  const enrollmentData = [
    { studentId: student1.id, courseId: cs101.id },
    { studentId: student1.id, courseId: cs201.id },
    { studentId: student1.id, courseId: ma201.id },
    { studentId: student1.id, courseId: cs301.id },
    { studentId: student2.id, courseId: cs101.id },
    { studentId: student2.id, courseId: cs201.id },
    { studentId: student2.id, courseId: ma101.id },
    { studentId: student3.id, courseId: ee101.id },
    { studentId: student3.id, courseId: ee201.id },
    { studentId: student3.id, courseId: ma201.id },
    { studentId: student4.id, courseId: ma201.id },
    { studentId: student4.id, courseId: ma101.id },
    { studentId: student4.id, courseId: cs101.id },
    { studentId: student5.id, courseId: cs101.id },
    { studentId: student5.id, courseId: cs201.id },
    { studentId: student5.id, courseId: cs301.id },
  ];
  await prisma.enrollment.createMany({ data: enrollmentData });
  console.log(`  ✅ ${enrollmentData.length} enrollments created`);

  // ── Timetable Entries ──────────────────────────────
  const timetableData: any[] = [];
  const timetableTemplate: Record<string, { courseId: string; start: string; end: string; room: string; type: string }[]> = {
    Monday: [
      { courseId: cs201.id, start: '09:00', end: '10:00', room: 'Room 301', type: 'lecture' },
      { courseId: ee101.id, start: '10:00', end: '11:00', room: 'Room 204', type: 'lecture' },
      { courseId: ma201.id, start: '11:15', end: '12:15', room: 'Room 105', type: 'lecture' },
      { courseId: cs201.id, start: '14:00', end: '16:00', room: 'Lab 102', type: 'lab' },
    ],
    Tuesday: [
      { courseId: cs301.id, start: '09:00', end: '10:00', room: 'Room 501', type: 'lecture' },
      { courseId: cs101.id, start: '10:00', end: '11:00', room: 'Room 301', type: 'lecture' },
      { courseId: ma101.id, start: '11:15', end: '12:15', room: 'Room 202', type: 'lecture' },
      { courseId: ee201.id, start: '14:00', end: '16:00', room: 'Lab 201', type: 'lab' },
    ],
    Wednesday: [
      { courseId: cs201.id, start: '09:00', end: '10:00', room: 'Room 301', type: 'lecture' },
      { courseId: cs101.id, start: '10:00', end: '11:00', room: 'Room 301', type: 'lecture' },
      { courseId: ma201.id, start: '14:00', end: '15:00', room: 'Room 105', type: 'tutorial' },
    ],
    Thursday: [
      { courseId: ee101.id, start: '09:00', end: '10:00', room: 'Room 204', type: 'lecture' },
      { courseId: cs301.id, start: '10:00', end: '11:00', room: 'Room 501', type: 'lecture' },
      { courseId: ma101.id, start: '11:15', end: '12:15', room: 'Room 202', type: 'lecture' },
      { courseId: cs301.id, start: '14:00', end: '16:00', room: 'Lab 301', type: 'lab' },
    ],
    Friday: [
      { courseId: cs201.id, start: '09:00', end: '10:00', room: 'Room 301', type: 'lecture' },
      { courseId: cs101.id, start: '10:00', end: '11:00', room: 'Room 301', type: 'lecture' },
      { courseId: ma201.id, start: '11:15', end: '12:15', room: 'Room 105', type: 'lecture' },
    ],
  };

  // Create timetable entries for each enrolled student based on their courses
  for (const enrollment of enrollmentData) {
    for (const [day, classes] of Object.entries(timetableTemplate)) {
      for (const cls of classes) {
        if (cls.courseId === enrollment.courseId) {
          timetableData.push({
            courseId: cls.courseId,
            studentId: enrollment.studentId,
            dayOfWeek: day,
            startTime: cls.start,
            endTime: cls.end,
            room: cls.room,
            type: cls.type,
          });
        }
      }
    }
  }
  await prisma.timetableEntry.createMany({ data: timetableData });
  console.log(`  ✅ ${timetableData.length} timetable entries created`);

  // ── Attendance (last 30 days) ──────────────────────
  const attendanceEntries: any[] = [];
  const statuses = ['present', 'present', 'present', 'present', 'absent', 'late'];
  for (let dayOffset = 1; dayOffset <= 25; dayOffset++) {
    const date = new Date();
    date.setDate(date.getDate() - dayOffset);
    if (date.getDay() === 0 || date.getDay() === 6) continue;

    for (const { studentId, courseId } of enrollmentData) {
      const facultyId = [cs101.id, cs201.id, cs301.id].includes(courseId) ? faculty1.id :
                         [ee101.id, ee201.id].includes(courseId) ? faculty2.id : faculty3.id;
      attendanceEntries.push({
        studentId,
        courseId,
        date,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        markedBy: facultyId,
      });
    }
  }
  await prisma.attendanceRecord.createMany({ data: attendanceEntries });
  console.log(`  ✅ ${attendanceEntries.length} attendance records created`);

  // ── Grades ─────────────────────────────────────────
  const gradeData: any[] = [];
  const components = ['Midterm', 'Assignment 1', 'Assignment 2', 'Quiz 1', 'Quiz 2'];
  for (const { studentId, courseId } of enrollmentData) {
    const facultyId = [cs101.id, cs201.id, cs301.id].includes(courseId) ? faculty1.id :
                       [ee101.id, ee201.id].includes(courseId) ? faculty2.id : faculty3.id;
    for (const component of components) {
      const maxScore = component === 'Midterm' ? 100 : component.startsWith('Assignment') ? 50 : 20;
      const score = Math.round((0.5 + Math.random() * 0.5) * maxScore);
      gradeData.push({ studentId, courseId, component, score, maxScore, gradedBy: facultyId });
    }
  }
  await prisma.grade.createMany({ data: gradeData });
  console.log(`  ✅ ${gradeData.length} grades created`);

  // ── Library Books ──────────────────────────────────
  const now = new Date();
  await prisma.libraryBook.createMany({
    data: [
      { title: 'Introduction to Algorithms', author: 'Cormen, Leiserson, Rivest, Stein', isbn: '978-0262033848', status: 'available', copies: 3, category: 'Computer Science' },
      { title: 'Operating System Concepts', author: 'Silberschatz, Galvin, Gagne', isbn: '978-1119800361', status: 'issued', copies: 0, borrowerId: student1.id, dueDate: new Date(now.getTime() + 7 * 86400000), category: 'Computer Science' },
      { title: 'Database System Concepts', author: 'Korth, Sudarshan', isbn: '978-0078022159', status: 'available', copies: 5, category: 'Computer Science' },
      { title: 'Computer Networking: A Top-Down Approach', author: 'Kurose, Ross', isbn: '978-0136681557', status: 'available', copies: 2, category: 'Computer Science' },
      { title: 'Clean Code', author: 'Robert C. Martin', isbn: '978-0132350884', status: 'overdue', copies: 0, borrowerId: student1.id, dueDate: new Date(now.getTime() - 10 * 86400000), category: 'Software Engineering' },
      { title: 'Design Patterns', author: 'Gamma, Helm, Johnson, Vlissides', isbn: '978-0201633610', status: 'issued', copies: 0, borrowerId: student2.id, dueDate: new Date(now.getTime() + 12 * 86400000), category: 'Software Engineering' },
      { title: 'Linear Algebra Done Right', author: 'Sheldon Axler', isbn: '978-3319110790', status: 'available', copies: 4, category: 'Mathematics' },
      { title: 'Fundamentals of Electric Circuits', author: 'Alexander, Sadiku', isbn: '978-0078028229', status: 'issued', copies: 0, borrowerId: student3.id, dueDate: new Date(now.getTime() + 5 * 86400000), category: 'Electrical Engineering' },
      { title: 'Digital Design and Computer Architecture', author: 'Harris, Harris', isbn: '978-0128000564', status: 'available', copies: 3, category: 'Electrical Engineering' },
      { title: 'Calculus: Early Transcendentals', author: 'James Stewart', isbn: '978-1285741550', status: 'available', copies: 6, category: 'Mathematics' },
    ],
  });
  console.log('  ✅ 10 library books created');

  // ── Fee Records ────────────────────────────────────
  const feeItems = [
    { item: 'Tuition Fee', amount: 75000 },
    { item: 'Lab Fee', amount: 8000 },
    { item: 'Library Fee', amount: 3000 },
    { item: 'Exam Fee', amount: 5000 },
    { item: 'Hostel Fee', amount: 45000 },
    { item: 'Transport Fee', amount: 12000 },
  ];
  const feeRecords: any[] = [];
  for (const student of [student1, student2, student3, student4, student5]) {
    for (let i = 0; i < feeItems.length; i++) {
      const isPaid = i < 3; // First 3 items are paid for all students
      const isOverdue = i === 5; // Transport fee is overdue
      feeRecords.push({
        studentId: student.id,
        item: feeItems[i].item,
        amount: feeItems[i].amount,
        status: isPaid ? 'paid' : isOverdue ? 'overdue' : 'pending',
        dueDate: isPaid ? new Date(now.getTime() - 30 * 86400000) : new Date(now.getTime() + (i * 7) * 86400000),
        paidAt: isPaid ? new Date(now.getTime() - (35 - i) * 86400000) : null,
        method: isPaid ? (i % 2 === 0 ? 'UPI' : 'Net Banking') : null,
        txnRef: isPaid ? `TXN-2026-${String(Math.floor(Math.random() * 9000) + 1000)}` : null,
        semester: 'Sem 6 (2025-26)',
      });
    }
  }
  await prisma.feeRecord.createMany({ data: feeRecords });
  console.log(`  ✅ ${feeRecords.length} fee records created`);

  // ── Bus Routes ─────────────────────────────────────
  const route1 = await prisma.busRoute.create({
    data: {
      routeCode: 'R1', routeName: 'City Center → Campus',
      stops: [
        { name: 'City Center', time: '07:30', order: 1 },
        { name: 'Railway Station', time: '07:45', order: 2 },
        { name: 'Market Area', time: '08:00', order: 3 },
        { name: 'Tech Park', time: '08:15', order: 4 },
        { name: 'Campus Main Gate', time: '08:30', order: 5 },
      ],
      schedule: [{ departure_time: '07:30', frequency_minutes: 30 }, { departure_time: '08:00', frequency_minutes: 30 }],
    },
  });
  const route2 = await prisma.busRoute.create({
    data: {
      routeCode: 'R2', routeName: 'Suburb → Campus',
      stops: [
        { name: 'Green Park', time: '07:15', order: 1 },
        { name: 'Lake View', time: '07:30', order: 2 },
        { name: 'MG Road', time: '07:45', order: 3 },
        { name: 'Campus South Gate', time: '08:00', order: 4 },
      ],
      schedule: [{ departure_time: '07:15', frequency_minutes: 45 }],
    },
  });
  const route3 = await prisma.busRoute.create({
    data: {
      routeCode: 'R3', routeName: 'Hostel Express',
      stops: [
        { name: 'Boys Hostel', time: '08:00', order: 1 },
        { name: 'Girls Hostel', time: '08:05', order: 2 },
        { name: 'Academic Block', time: '08:15', order: 3 },
        { name: 'Library', time: '08:20', order: 4 },
      ],
      schedule: [{ departure_time: '08:00', frequency_minutes: 20 }],
    },
  });

  const bus1 = await prisma.bus.create({ data: { registration: 'KA-01-AB-1234', routeId: route1.id, capacity: 50, driverName: 'Ramesh Kumar', driverPhone: '+91-9000000001' } });
  const bus2 = await prisma.bus.create({ data: { registration: 'KA-01-CD-5678', routeId: route2.id, capacity: 40, driverName: 'Suresh Rao', driverPhone: '+91-9000000002' } });
  const bus3 = await prisma.bus.create({ data: { registration: 'KA-01-EF-9012', routeId: route3.id, capacity: 30, driverName: 'Mahesh Patil', driverPhone: '+91-9000000003' } });

  await prisma.busLocation.createMany({
    data: [
      { busId: bus1.id, lat: 12.9716, lng: 77.5946, currentStop: 'Market Area', nextStop: 'Tech Park', occupancyPct: 72 },
      { busId: bus2.id, lat: 12.9352, lng: 77.6245, currentStop: 'Lake View', nextStop: 'MG Road', occupancyPct: 45 },
      { busId: bus3.id, lat: 12.9141, lng: 77.6411, currentStop: 'Girls Hostel', nextStop: 'Academic Block', occupancyPct: 88 },
    ],
  });
  console.log('  ✅ Bus routes, buses & locations created');

  // ── Events ─────────────────────────────────────────
  const event1 = await prisma.event.create({
    data: { title: 'TechFest 2026', description: 'Annual technology festival featuring coding competitions, hackathons, and tech talks from industry leaders.',
      venue: 'Main Auditorium', startsAt: new Date(now.getTime() + 7 * 86400000), endsAt: new Date(now.getTime() + 9 * 86400000),
      organizerId: faculty1.id, category: 'cultural', maxAttendees: 500 },
  });
  const event2 = await prisma.event.create({
    data: { title: 'Workshop: Machine Learning with Python', description: 'Hands-on workshop covering ML basics, neural networks, and practical projects with real datasets.',
      venue: 'CS Lab 3', startsAt: new Date(now.getTime() + 3 * 86400000),
      organizerId: faculty1.id, category: 'workshop', maxAttendees: 60 },
  });
  await prisma.event.create({
    data: { title: 'Inter-College Cricket Tournament', description: 'Annual cricket tournament with teams from 8 colleges competing for the Chancellor\'s Trophy.',
      venue: 'Sports Ground', startsAt: new Date(now.getTime() + 14 * 86400000), endsAt: new Date(now.getTime() + 16 * 86400000),
      organizerId: admin.id, category: 'sports', maxAttendees: 200 },
  });
  await prisma.event.create({
    data: { title: 'Guest Lecture: AI Ethics in Modern Society', description: 'Distinguished lecture on responsible AI development and the societal implications of artificial intelligence.',
      venue: 'Seminar Hall B', startsAt: new Date(now.getTime() + 5 * 86400000),
      organizerId: faculty3.id, category: 'seminar', maxAttendees: 150 },
  });
  await prisma.event.create({
    data: { title: 'Research Paper Presentation', description: 'Final year students present their research papers to a panel of faculty and industry experts.',
      venue: 'Conference Room A', startsAt: new Date(now.getTime() + 10 * 86400000),
      organizerId: faculty2.id, category: 'academic', maxAttendees: 80 },
  });

  await prisma.eventRegistration.createMany({
    data: [
      { eventId: event1.id, userId: student1.id },
      { eventId: event1.id, userId: student2.id },
      { eventId: event1.id, userId: student5.id },
      { eventId: event1.id, userId: alumni1.id },
      { eventId: event2.id, userId: student1.id },
      { eventId: event2.id, userId: student3.id },
      { eventId: event2.id, userId: student4.id },
    ],
  });
  console.log('  ✅ Events & registrations created');

  // ── Marketplace Listings ───────────────────────────
  await prisma.marketplaceListing.createMany({
    data: [
      { sellerId: student2.id, title: 'Engineering Mathematics Textbook', description: 'Kreyszig Advanced Engineering Mathematics, 10th Edition. Good condition, minor highlighting.', price: 350, category: 'textbooks', condition: 'good', imageUrls: [], status: 'approved' },
      { sellerId: student1.id, title: 'Scientific Calculator - Casio fx-991EX', description: 'Barely used ClassWiz, comes in original box with manual and case.', price: 800, category: 'electronics', condition: 'like_new', imageUrls: [], status: 'approved' },
      { sellerId: student5.id, title: 'Laptop Stand - Adjustable Aluminum', description: 'Ergonomic aluminum laptop stand, adjustable height and angle. Supports up to 17".', price: 500, category: 'accessories', condition: 'new', imageUrls: [], status: 'approved' },
      { sellerId: student3.id, title: 'Complete C Programming Notes', description: 'Hand-written notes covering entire CS101 syllabus with solved examples and previous year questions.', price: 150, category: 'notes', condition: 'good', imageUrls: [], status: 'approved' },
      { sellerId: alumni1.id, title: 'Mini Fridge for Hostel', description: '50L capacity, perfect for hostel room. 1 year old, energy efficient.', price: 4500, category: 'furniture', condition: 'good', imageUrls: [], status: 'approved' },
      { sellerId: student4.id, title: 'Guitar - Yamaha F310', description: 'Acoustic guitar with capo, pick set, and gig bag. Great for beginners.', price: 6000, category: 'others', condition: 'good', imageUrls: [], status: 'approved' },
      { sellerId: student2.id, title: 'Wireless Mouse - Logitech M720', description: 'Multi-device wireless mouse, connects to 3 devices. 6 months old.', price: 1200, category: 'electronics', condition: 'like_new', imageUrls: [], status: 'approved' },
      { sellerId: alumni2.id, title: 'Physics Lab Manual Bundle', description: 'Complete set of physics lab manuals for all 4 semesters.', price: 200, category: 'textbooks', condition: 'good', imageUrls: [], status: 'approved' },
    ],
  });
  console.log('  ✅ Marketplace listings created');

  // ── Service Requests ───────────────────────────────
  await prisma.serviceRequest.createMany({
    data: [
      { studentId: student1.id, type: 'bonafide', description: 'Need bonafide certificate for passport application. Required urgently.', status: 'pending', priority: 'high' },
      { studentId: student2.id, type: 'transcript', description: 'Academic transcript for graduate school applications (MS in CS, Fall 2026).', status: 'processing', priority: 'medium', handledBy: admin.id },
      { studentId: student3.id, type: 'maintenance', description: 'AC not working in Hostel Room 204 for the past 3 days.', status: 'completed', priority: 'urgent', handledBy: admin2.id },
      { studentId: student4.id, type: 'library_card', description: 'Lost library card during Diwali break, need replacement.', status: 'pending', priority: 'low' },
      { studentId: student1.id, type: 'it_support', description: 'Cannot access campus WiFi (eduroam) on new laptop. Windows 11.', status: 'processing', priority: 'medium', handledBy: admin.id },
      { studentId: student5.id, type: 'hostel', description: 'Request for room change due to plumbing issues in Block C Room 312.', status: 'pending', priority: 'high' },
    ],
  });
  console.log('  ✅ Service requests created');

  // ── Notifications ──────────────────────────────────
  await prisma.notification.createMany({
    data: [
      { userId: student1.id, title: 'Attendance Alert', body: 'Your attendance in CS201 has dropped below 75%. Please attend regularly to avoid detention.', type: 'warning' },
      { userId: student1.id, title: 'New Grade Posted', body: 'Prof. Sharma posted Quiz 2 grades for CS101. Check your grades section.', type: 'info' },
      { userId: student1.id, title: 'Event Reminder', body: 'TechFest 2026 starts in 7 days. You are registered for the Hackathon track!', type: 'info' },
      { userId: student1.id, title: 'Fee Payment Due', body: 'Semester fee payment deadline is approaching. Hostel and Transport fees are pending.', type: 'warning' },
      { userId: student1.id, title: 'Library Overdue', body: 'The book "Clean Code" is overdue by 10 days. Please return it to avoid a fine.', type: 'error' },
      { userId: student2.id, title: 'Transcript Request Update', body: 'Your transcript request is now being processed. Expected delivery: 3-5 working days.', type: 'success' },
      { userId: student3.id, title: 'Maintenance Completed', body: 'AC repair in Hostel Room 204 has been completed. Please verify and confirm.', type: 'success', isRead: true },
      { userId: student4.id, title: 'Welcome to Campusly', body: 'Your account has been set up. Explore timetable, library, and campus events.', type: 'info' },
      { userId: student5.id, title: 'New Marketplace Listing', body: 'Your listing "Laptop Stand - Adjustable Aluminum" is now live on the marketplace.', type: 'success' },
      { userId: faculty1.id, title: 'Grade Submission Reminder', body: 'Midterm grades for CS201 are due this Friday. Please submit via the portal.', type: 'warning' },
      { userId: faculty2.id, title: 'New Student Enrollment', body: '3 new students have enrolled in EE201 Digital Electronics for this semester.', type: 'info' },
      { userId: admin.id, title: 'Pending Service Requests', body: 'There are 3 pending service requests requiring your attention.', type: 'info' },
    ],
  });
  console.log('  ✅ Notifications created');

  console.log('\n🎉 Seed complete!');
  console.log('\n📋 Login credentials:');
  console.log('  Admin:    admin@campusly.edu / admin123');
  console.log('  Faculty:  prof.sharma@campusly.edu / faculty123');
  console.log('  Student:  rahul@campusly.edu / student123');
  console.log('  Alumni:   anita.alumni@campusly.edu / alumni123');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
