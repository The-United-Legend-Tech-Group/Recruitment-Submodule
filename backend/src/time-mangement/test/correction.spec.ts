jest.mock('../repository/attendance.repository', () => ({
  AttendanceRepository: jest.fn().mockImplementation(() => ({})),
}));

jest.mock('../repository/attendance-correction.repository', () => ({
  AttendanceCorrectionRepository: jest.fn().mockImplementation(() => ({})),
}));

jest.mock('../repository/correction-audit.repository', () => ({
  CorrectionAuditRepository: jest.fn().mockImplementation(() => ({})),
}));

import { TimeService } from '../time.service';

describe('TimeService - Attendance Correction flows', () => {
  let mockAttendanceRepo: any;
  let mockCorrectionRepo: any;
  let mockAuditRepo: any;
  let service: TimeService;

  beforeEach(() => {
    mockAttendanceRepo = {};
    mockCorrectionRepo = {
      create: jest
        .fn()
        .mockImplementation((dto) => Promise.resolve({ _id: 'c1', ...dto })),
      findById: jest.fn(),
      updateById: jest
        .fn()
        .mockImplementation((id, update) =>
          Promise.resolve({ _id: id, ...update }),
        ),
    };
    mockAuditRepo = { create: jest.fn() };

    service = new TimeService(
      {},
      {},
      undefined,
      undefined,
      mockAttendanceRepo,
      mockCorrectionRepo,
      mockAuditRepo,
    );
  });

  it('submits a correction request and creates an audit entry', async () => {
    const dto = {
      employeeId: 'emp1',
      attendanceRecordId: 'a1',
      punches: [],
      reason: 'missed',
    } as any;
    const res = await service.submitAttendanceCorrection(dto);

    expect(mockCorrectionRepo.create).toHaveBeenCalled();
    expect(mockAuditRepo.create).toHaveBeenCalled();
    expect(res).toHaveProperty('_id', 'c1');
  });

  it('approves and applies a correction', async () => {
    mockCorrectionRepo.findById.mockResolvedValueOnce({
      _id: 'c2',
      punches: [{ type: 'IN', time: new Date() }],
      attendanceRecord: 'a2',
    });
    mockAttendanceRepo.updateById = jest
      .fn()
      .mockResolvedValue({ _id: 'a2', punches: [] });

    const res = await service.approveAndApplyCorrection('c2', 'mgr1');

    expect(mockCorrectionRepo.findById).toHaveBeenCalledWith('c2');
    expect(mockAttendanceRepo.updateById).toHaveBeenCalled();
    expect(mockCorrectionRepo.updateById).toHaveBeenCalledWith('c2', {
      status: 'APPROVED',
    });
    expect(mockAuditRepo.create).toHaveBeenCalled();
    expect(res).toHaveProperty('updatedAttendance');
  });
});
