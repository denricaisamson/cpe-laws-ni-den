// =====================================================================
// FILIPINO SIGN LANGUAGE (FSL) WORKSHOP SYSTEM
// Unified SQLite API Route for Client-Server Sync
// File: src/app/api/sqlite/route.ts
// =====================================================================

import { NextRequest, NextResponse } from 'next/server';
import { SqliteRepo } from '@/lib/sqlite/repository';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const entity = searchParams.get('entity');

    switch (entity) {
      case 'profiles':
        return NextResponse.json({ data: SqliteRepo.getProfiles() });
      case 'workshops':
        return NextResponse.json({ data: SqliteRepo.getWorkshops() });
      case 'schedules':
        return NextResponse.json({ data: SqliteRepo.getSchedules() });
      case 'enrollments':
        return NextResponse.json({ data: SqliteRepo.getEnrollments() });
      case 'payments':
        return NextResponse.json({ data: SqliteRepo.getPayments() });
      case 'attendance':
        return NextResponse.json({ data: SqliteRepo.getAttendance() });
      case 'assignments':
        return NextResponse.json({ data: SqliteRepo.getAssignments() });
      case 'submissions':
        return NextResponse.json({ data: SqliteRepo.getSubmissions() });
      case 'materials':
        return NextResponse.json({ data: SqliteRepo.getMaterials() });
      case 'videos':
        return NextResponse.json({ data: SqliteRepo.getVideos() });
      case 'announcements':
        return NextResponse.json({ data: SqliteRepo.getAnnouncements() });
      case 'messages':
        return NextResponse.json({ data: SqliteRepo.getMessages() });
      case 'news_events':
        return NextResponse.json({ data: SqliteRepo.getNewsEvents() });
      case 'products':
        return NextResponse.json({ data: SqliteRepo.getProducts() });
      default:
        return NextResponse.json({ data: SqliteRepo.getDatabaseSnapshot() });
    }
  } catch (err: any) {
    console.error('Error querying SQLite:', err);
    return NextResponse.json({ error: err.message || 'SQLite query error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, payload } = body;

    switch (action) {
      case 'create_workshop': {
        const item = SqliteRepo.createWorkshop(payload);
        return NextResponse.json({ success: true, data: item });
      }
      case 'update_workshop': {
        const item = SqliteRepo.updateWorkshop(payload.id, payload);
        return NextResponse.json({ success: true, data: item });
      }
      case 'create_schedule': {
        const item = SqliteRepo.createSchedule(payload);
        return NextResponse.json({ success: true, data: item });
      }
      case 'update_schedule': {
        const item = SqliteRepo.updateSchedule(payload.id, payload);
        return NextResponse.json({ success: true, data: item });
      }
      case 'create_enrollment': {
        const item = SqliteRepo.createEnrollment(payload);
        return NextResponse.json({ success: true, data: item });
      }
      case 'create_payment': {
        const item = SqliteRepo.createPayment(payload);
        return NextResponse.json({ success: true, data: item });
      }
      case 'verify_payment': {
        const res = SqliteRepo.verifyPayment(payload.paymentId);
        return NextResponse.json({ success: true, data: res });
      }
      case 'record_attendance': {
        const item = SqliteRepo.recordAttendance(payload);
        return NextResponse.json({ success: true, data: item });
      }
      case 'create_assignment': {
        const item = SqliteRepo.createAssignment(payload);
        return NextResponse.json({ success: true, data: item });
      }
      case 'submit_assignment': {
        const item = SqliteRepo.submitAssignment(payload);
        return NextResponse.json({ success: true, data: item });
      }
      case 'grade_submission': {
        const item = SqliteRepo.gradeSubmission(payload.submissionId, payload.grade, payload.feedback);
        return NextResponse.json({ success: true, data: item });
      }
      case 'create_material': {
        const item = SqliteRepo.createMaterial(payload);
        return NextResponse.json({ success: true, data: item });
      }
      case 'create_video': {
        const item = SqliteRepo.createVideo(payload);
        return NextResponse.json({ success: true, data: item });
      }
      case 'create_announcement': {
        const item = SqliteRepo.createAnnouncement(payload);
        return NextResponse.json({ success: true, data: item });
      }
      case 'send_message': {
        const item = SqliteRepo.sendMessage(payload);
        return NextResponse.json({ success: true, data: item });
      }
      case 'order_product': {
        const item = SqliteRepo.decrementProductStock(payload.productId, payload.quantity || 1);
        return NextResponse.json({ success: true, data: item });
      }
      case 'update_profile_role': {
        const item = SqliteRepo.updateProfileRole(payload.userId, payload.role);
        return NextResponse.json({ success: true, data: item });
      }
      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (err: any) {
    console.error('Error executing SQLite mutation:', err);
    return NextResponse.json({ error: err.message || 'SQLite mutation error' }, { status: 500 });
  }
}
