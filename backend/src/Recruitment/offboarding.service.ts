import {Injectable,NotFoundException,BadRequestException,} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {TerminationRequest,TerminationRequestDocument,} from './models/termination-request.schema';
import { Contract, ContractDocument } from './models/contract.schema';
import {ClearanceChecklist,ClearanceChecklistDocument,} from './models/clearance-checklist.schema';
import {AppraisalRecord,AppraisalRecordDocument,} from '../employee-subsystem/performance/models/appraisal-record.schema';
import {EmployeeProfile,EmployeeProfileDocument,} from '../employee-subsystem/employee/models/employee-profile.schema';
import {EmployeeSystemRole,EmployeeSystemRoleDocument,} from '../employee-subsystem/employee/models/employee-system-role.schema';
import { Notification } from '../employee-subsystem/notification/schema/notification.schema';
import {LeaveEntitlement,LeaveEntitlementDocument,} from '../leaves/models/leave-entitlement.schema';
import {LeaveType,LeaveTypeDocument,} from '../leaves/models/leave-type.schema';
import {EmployeeTerminationResignation,EmployeeTerminationResignationDocument,} from '../payroll/execution/models/EmployeeTerminationResignation.schema';
import { InitiateTerminationReviewDto } from './offboardingDtos/initiate-termination-review.dto';
import { InitiateOffboardingChecklistDto } from './offboardingDtos/initiate-offboarding-checklist.dto';
import { SendOffboardingNotificationDto } from './offboardingDtos/send-offboarding-notification.dto';
import { SubmitResignationDto } from './offboardingDtos/submit-resignation.dto';
import { TrackResignationStatusDto } from './offboardingDtos/track-resignation-status.dto';
import { RevokeSystemAccessDto } from './offboardingDtos/revoke-system-access.dto';
import { DepartmentClearanceSignOffDto } from './offboardingDtos/department-clearance-signoff.dto';
import { TerminationStatus } from './enums/termination-status.enum';
import { TerminationInitiation } from './enums/termination-initiation.enum';
import { ApprovalStatus } from './enums/approval-status.enum';
import { EmployeeStatus } from '../employee-subsystem/employee/enums/employee-profile.enums';
@Injectable()
export class OffboardingService {
  constructor(
    @InjectModel(TerminationRequest.name)
    private terminationRequestModel: Model<TerminationRequestDocument>,
    @InjectModel(Contract.name)
    private contractModel: Model<ContractDocument>,
    @InjectModel(ClearanceChecklist.name)
    private clearanceChecklistModel: Model<ClearanceChecklistDocument>,
    @InjectModel(AppraisalRecord.name)
    private appraisalRecordModel: Model<AppraisalRecordDocument>,
    @InjectModel(EmployeeProfile.name)
    private employeeProfileModel: Model<EmployeeProfileDocument>,
    @InjectModel(EmployeeSystemRole.name)
    private employeeSystemRoleModel: Model<EmployeeSystemRoleDocument>,
    @InjectModel(Notification.name)
    private notificationModel: Model<Notification>,
    @InjectModel(LeaveEntitlement.name)
    private leaveEntitlementModel: Model<LeaveEntitlementDocument>,
    @InjectModel(LeaveType.name)
    private leaveTypeModel: Model<LeaveTypeDocument>,
    @InjectModel(EmployeeTerminationResignation.name)
    private employeeTerminationResignationModel: Model<EmployeeTerminationResignationDocument>,
  ) {}


  //OFF-001 
  // (As an HR Manager, initiating termination reviews based on warnings and performance data / manager requests, so that exits are justified.)

  async initiateTerminationReview(dto: InitiateTerminationReviewDto,
  ): Promise<TerminationRequest> {
    console.log(`Initiating termination review for employee ${dto.employeeId} by ${dto.initiator}`
    );
    const employeeObjectId = new Types.ObjectId(dto.employeeId);
    const contractObjectId = new Types.ObjectId(dto.contractId);

    //TODO:maybe we will use service of the employeeProfileModel instead 

    const employee = await this.employeeProfileModel.findById(employeeObjectId).exec();
    if (!employee) {
      console.error(`Employee with ID ${dto.employeeId} not found`);
      throw new NotFoundException(`Employee with ID ${dto.employeeId} not found`);
    }
    console.log(`Employee ${dto.employeeId} validated successfully`);
    const contract = await this.contractModel.findById(contractObjectId).exec();
    if (!contract) {
      console.error(`Contract with ID ${dto.contractId} not found`);
      throw new NotFoundException(`Contract with ID ${dto.contractId} not found`);
    }

    console.log(`Contract ${dto.contractId} validated successfully`);

    const existingTerminationRequest = await this.terminationRequestModel
      .findOne({
        employeeId: employeeObjectId,
        status: {
          $in: [TerminationStatus.PENDING, TerminationStatus.UNDER_REVIEW],
        },
      })
      .exec();

    if (existingTerminationRequest) {
      console.warn(`Employee ${dto.employeeId} already has an active termination request`);
      throw new BadRequestException(`Employee ${dto.employeeId} already has an active termination request with status ${existingTerminationRequest.status}`);
    }
    const latestAppraisal = await this.appraisalRecordModel
      .findOne({
        employeeProfileId: employeeObjectId,
      })
      .sort({ createdAt: -1 }) //added value to be -1 to sort by the latest records
      .exec();

    if (latestAppraisal) {
      console.log(`Found performance data for employee ${dto.employeeId}: Score ${latestAppraisal.totalScore}, Status: ${latestAppraisal.status}`);
    } else {
      console.log(
        `No performance data found for employee ${dto.employeeId}`,
      );
    }

    //  TODO: what factors do we consider before making the termiantion request
    //e.g: specific score,specific rating,etc?

    const terminationRequest = new this.terminationRequestModel({
      employeeId: employeeObjectId,
      contractId: contractObjectId,
      initiator: dto.initiator,
      reason: dto.reason,
      employeeComments: dto.employeeComments,
      hrComments: dto.hrComments,
      status: TerminationStatus.PENDING
    });
    const savedTerminationRequest = await terminationRequest.save();
    console.log(`Termination review initiated successfully for employee ${dto.employeeId} with ID ${savedTerminationRequest._id}`);
    return savedTerminationRequest;
  }
   

  //OFF-006
  // (As an HR Manager, I want an offboarding checklist (IT assets, ID cards, equipment), so no company property is lost.)

  async initiateOffboardingChecklist(dto: InitiateOffboardingChecklistDto,
  ): Promise<ClearanceChecklist> {
    console.log(`Initiating offboarding checklist for termination request ${dto.terminationId}`);

    const terminationObjectId = new Types.ObjectId(dto.terminationId);
    
    const terminationRequest = await this.terminationRequestModel
      .findById(terminationObjectId)
      .exec();

    if (!terminationRequest) {
      console.error(`Termination request with ID ${dto.terminationId} not found`);
      throw new NotFoundException(`Termination request with ID ${dto.terminationId} not found`);
    }

    console.log(`Termination request ${dto.terminationId} validated successfully`);

    const existingChecklist = await this.clearanceChecklistModel
      .findOne({
        terminationId: terminationObjectId,
      })
      .exec();

    if (existingChecklist) {
      console.warn(
        `Offboarding checklist already exists for termination request ${dto.terminationId}`,
      );
      throw new BadRequestException(`Offboarding checklist already exists for termination request ${dto.terminationId}`
      );
    }


    //TODO
    //Will we take each department from different subsystems?
    //e.g : finance from payroll , IT from employee subsystem

    const departmentItems = dto.items.map((item) => ({
      department: item.department,
      status: ApprovalStatus.PENDING,
      comments: item.comments,
      updatedBy: null,
      updatedAt: null,
    }));

    console.log(`Processing ${departmentItems.length} department approval items`);
    

    const equipmentItems = dto.equipmentList.map((item) => ({
      equipmentId: new Types.ObjectId(item.equipmentId),
      name: item.name,
      returned: item.returned,
      condition: item.condition,
    }));

    console.log(`Processing ${equipmentItems.length} equipment items`);

    const clearanceChecklist = new this.clearanceChecklistModel({
      terminationId: terminationObjectId,
      items: departmentItems,
      equipmentList: equipmentItems,

      // Setting card returned status from DTO, defaults to false if not provided
      cardReturned: dto.cardReturned ?? false,
    });

    const savedChecklist = await clearanceChecklist.save();

    console.log(`Offboarding checklist created successfully with ID ${savedChecklist._id}`);

    return savedChecklist;
  }


//OFF-007
//As a System Admin, I want to revoke system and account access upon termination, so security is maintained.

  async revokeSystemAccess(dto: RevokeSystemAccessDto): Promise<{
    message: string;
    employeeId: string;
    employeeNumber: string;
    previousStatus: string;
    newStatus: string;
    accessRevoked: boolean;
    rolesDeactivated: boolean;
  }> {
    console.log(`System Admin initiating access revocation for termination request ${dto.terminationRequestId}`);

    const terminationObjectId = new Types.ObjectId(dto.terminationRequestId);

    const terminationRequest = await this.terminationRequestModel
      .findById(terminationObjectId)
      .exec();

    if (!terminationRequest) {
      console.error(`Termination request with ID ${dto.terminationRequestId} not found`);
      throw new NotFoundException(`Termination request with ID ${dto.terminationRequestId} not found`);
    }

    console.log(`Termination request ${dto.terminationRequestId} validated successfully`);

    if (terminationRequest.status !== TerminationStatus.APPROVED) {
      console.warn(`Termination request ${dto.terminationRequestId} is not approved. Current status: ${terminationRequest.status}`);

      throw new BadRequestException(`Cannot revoke access for termination request with status: ${terminationRequest.status}. Only APPROVED terminations can have access revoked.`);
    }

    const employee = await this.employeeProfileModel
      .findById(terminationRequest.employeeId)
      .exec();

    if (!employee) {
      console.error(`Employee with ID ${terminationRequest.employeeId} not found`);
      throw new NotFoundException(`Employee with ID ${terminationRequest.employeeId} not found`);
    }
    console.log(`Employee ${employee.employeeNumber} retrieved successfully. Current status: ${employee.status}`);

    const previousStatus = employee.status;
    
    employee.status = EmployeeStatus.TERMINATED;
    employee.statusEffectiveFrom = new Date(); // Set effective date to now

    await employee.save();

    console.log(`Employee ${employee.employeeNumber} status updated from ${previousStatus} to ${EmployeeStatus.TERMINATED}`);

    const systemRole = await this.employeeSystemRoleModel
      .findOne({
        employeeProfileId: terminationRequest.employeeId,
      })
      .exec();

    let rolesDeactivated = false;
    let previousRoles: string[] = [];
    let previousPermissions: string[] = [];

    if (systemRole) {
      previousRoles = [...systemRole.roles];
      previousPermissions = [...systemRole.permissions];
      systemRole.isActive = false;

      await systemRole.save();

      rolesDeactivated = true;

      console.log(`System access revoked for employee ${employee.employeeNumber}`);
      console.log(`Deactivated roles: ${previousRoles.join(', ')}`);
      console.log(`Revoked permissions: ${previousPermissions.length} permission(s)`);
    } else {
      console.warn(`No system role found for employee ${employee.employeeNumber}`);
    }


    const securityNotificationPayload = {
      recipientId: [terminationRequest.employeeId], // TODO: Replace with actual System System Admin/HR IDS
      type: 'Alert',
      deliveryType: 'MULTICAST',
      title: `Security Alert: Access Revoked - ${employee.employeeNumber}`,
      message: `System and account access has been successfully revoked for terminated employee.\n\nEmployee Details:\n- Employee Number: ${employee.employeeNumber}\n- Name: ${employee.firstName} ${employee.lastName}\n- Previous Status: ${previousStatus}\n- New Status: ${EmployeeStatus.TERMINATED}\n\nAccess Revocation:\n- System Access Deactivated: ${rolesDeactivated ? 'YES' : 'NO'}\n- Previous Roles: ${previousRoles.length > 0 ? previousRoles.join(', ') : 'None'}\n- Permissions Revoked: ${previousPermissions.length}\n- Effective Date: ${new Date().toISOString()}\n\nTermination Details:\n- Termination Request ID: ${terminationRequest._id}\n- Initiated By: ${terminationRequest.initiator}\n- Reason: ${terminationRequest.reason}\n- Termination Date: ${terminationRequest.terminationDate || 'Not specified'}\n\nRevocation Reason: ${dto.revocationReason || 'Standard termination procedure'}\n\nSecurity Status: All system and account access has been revoked. Employee can no longer access company systems.`,
      relatedEntityId: terminationRequest._id.toString(),
      relatedModule: 'Recruitment',
      isRead: false,
    };
    //TODO: we will use the notificationService instead 
    const securityNotification = new this.notificationModel(
      securityNotificationPayload,
    );
    await securityNotification.save();

    console.log(`Security notification sent for access revocation of employee ${employee.employeeNumber}`);

    const employeeNotificationPayload = {
      recipientId: [terminationRequest.employeeId],
      type: 'Info',
      deliveryType: 'UNICAST',
      title: `Account Access Update`,
      message: `Your system and account access has been updated following your termination.\n\nEmployee Number: ${employee.employeeNumber}\nStatus: ${EmployeeStatus.TERMINATED}\nEffective Date: ${new Date().toISOString()}\n\nPlease contact HR if you have any questions regarding your final settlement or benefits.`,
      relatedEntityId: terminationRequest._id.toString(),
      relatedModule: 'Recruitment',
      isRead: false,
    };
    //TODO: we will use the notificationService instead 
    const employeeNotification = new this.notificationModel(
      employeeNotificationPayload,
    );
    await employeeNotification.save();

    console.log(`Informational notification sent to terminated employee ${employee.employeeNumber}`);

    console.log(`Access revocation completed successfully for employee ${employee.employeeNumber}`);
    
    return {
      message: `System and account access successfully revoked for employee ${employee.employeeNumber}`,
      employeeId: employee._id.toString(),
      employeeNumber: employee.employeeNumber,
      previousStatus: previousStatus,
      newStatus: EmployeeStatus.TERMINATED,
      accessRevoked: true,
      rolesDeactivated: rolesDeactivated,
    };
  }





  //OFF-013
  //As HR Manager, I want to send offboarding notification to trigger benefits termination and final pay calc (unused leave, deductions), so settlements are accurate.

  async sendOffboardingNotification(dto: SendOffboardingNotificationDto,): Promise<Notification> {
    console.log(`Sending offboarding notification for termination request ${dto.terminationRequestId}`);

    const terminationObjectId = new Types.ObjectId(dto.terminationRequestId);

    const terminationRequest = await this.terminationRequestModel
      .findById(terminationObjectId)
      .exec();

    if (!terminationRequest) {
      console.error(`Termination request with ID ${dto.terminationRequestId} not found`);
      throw new NotFoundException(`Termination request with ID ${dto.terminationRequestId} not found`);
    }

    console.log(`Termination request ${dto.terminationRequestId} validated successfully`);
    
    const employee = await this.employeeProfileModel
      .findById(terminationRequest.employeeId)
      .exec();

    if (!employee) {
      console.error(`Employee with ID ${terminationRequest.employeeId} not found`);
      throw new NotFoundException(`Employee with ID ${terminationRequest.employeeId} not found`);
    }

    console.log(`Employee ${employee.employeeNumber} retrieved successfully`);

    const leaveEntitlements = await this.leaveEntitlementModel
      .find({
        employeeId: terminationRequest.employeeId,
      })
      .populate('leaveTypeId')
      .exec();

    let totalUnusedAnnualLeave = 0;
    const unusedLeaveDetails: string[] = [];

    for (const entitlement of leaveEntitlements) {
      const leaveType = entitlement.leaveTypeId as any;
      if (leaveType &&leaveType.paid === true &&leaveType.deductible === true &&
          entitlement.remaining > 0
      ) {
        const unusedDays = entitlement.remaining;
        totalUnusedAnnualLeave += unusedDays;
        unusedLeaveDetails.push(
          `${leaveType.name}: ${unusedDays} days (to be encashed)`,
        );
      }
    }

    console.log(`Leave balance reviewed: ${totalUnusedAnnualLeave} days of unused annual leave found`);

    const benefitTerminations = await this.employeeTerminationResignationModel
      .find({
        employeeId: terminationRequest.employeeId,
        terminationId: terminationObjectId,
      })
      .populate('benefitId') // Populate to get benefit details
      .exec();

    console.log(`Found ${benefitTerminations.length} benefit termination records`);

    const benefitsInfo: string[] = [];
    if (benefitTerminations.length > 0) {
      for (const benefitTerm of benefitTerminations) {
        const benefit = benefitTerm.benefitId as any;
        benefitsInfo.push(
          `${benefit?.name || 'Benefit'}: Status ${benefitTerm.status}`,
        );
      }
    } else {
      benefitsInfo.push('Note: Benefits plans are set to be auto-terminated as of the end of the notice period');
    }

    const notificationTitle = `Offboarding Notification: ${employee.employeeNumber}`;

    let notificationMessage = `Offboarding notification for employee ${employee.employeeNumber}.\n\n`;
    notificationMessage += `Termination Status: ${terminationRequest.status}\n`;
    notificationMessage += `Termination Reason: ${terminationRequest.reason}\n`;
    notificationMessage += `Initiated By: ${terminationRequest.initiator}\n\n`;

    notificationMessage += `--- LEAVE BALANCE REVIEW ---\n`;
    if (totalUnusedAnnualLeave > 0) {
      notificationMessage += `Total Unused Annual Leave: ${totalUnusedAnnualLeave} days\n`;
      notificationMessage += `Details:\n${unusedLeaveDetails.join('\n')}\n`;
      notificationMessage += `Action Required: Encash unused annual leave in final settlement\n\n`;
    } else {
      notificationMessage += `No unused annual leave to be encashed\n\n`;
    }

    notificationMessage += `--- BENEFITS TERMINATION ---\n`;
    notificationMessage += benefitsInfo.join('\n');
    notificationMessage += `\n\n`;

    notificationMessage += `--- FINAL PAY CALCULATION REQUIRED ---\n`;
    notificationMessage += `Please process:\n`;
    notificationMessage += `1. Unused annual leave encashment (${totalUnusedAnnualLeave} days)\n`;
    notificationMessage += `2. Any pending deductions or penalties\n`;
    notificationMessage += `3. Pro-rata salary calculation\n`;
    notificationMessage += `4. Benefits termination settlement\n`;
    notificationMessage += `5. End of service gratuity (if applicable)\n\n`;

    if (dto.additionalMessage) {
      notificationMessage += `--- ADDITIONAL NOTES ---\n`;
      notificationMessage += `${dto.additionalMessage}\n\n`;
    }

    notificationMessage += `This notification triggers the final settlement process. Please review and process accordingly.`;

    const notificationPayload = {
      recipientId: [terminationRequest.employeeId], // This should be updated to actual HR/Finance user IDs
      type: 'Alert',
      deliveryType: 'MULTICAST',
      // Title constructed above with employee number
      title: notificationTitle,
      // Comprehensive message constructed above with all settlement details
      message: notificationMessage,
      // relatedEntityId references the termination request as per Notification schema
      relatedEntityId: terminationObjectId.toString(),
      // relatedModule is 'Recruitment' to identify the source module as per Notification schema
      relatedModule: 'Recruitment',
      // isRead defaults to false as per Notification schema
      isRead: false,
    };

    const notification = new this.notificationModel(notificationPayload);

    const savedNotification = await notification.save();

    console.log(`Offboarding notification sent successfully with ID ${savedNotification._id}`);
    console.log(`Notification covers: ${totalUnusedAnnualLeave} days unused leave, ${benefitTerminations.length} benefit records`);

    return savedNotification;
  }



  //OFF-018
  //As an Employee, I want to be able to request a Resignation request with reasoning
  async submitResignation(dto: SubmitResignationDto): Promise<TerminationRequest> {
    console.log(`Employee ${dto.employeeId} submitting resignation request`);
    const employeeObjectId = new Types.ObjectId(dto.employeeId);
    const contractObjectId = new Types.ObjectId(dto.contractId);

    const employee = await this.employeeProfileModel
      .findById(employeeObjectId)
      .exec();

    if (!employee) {
      console.error(`Employee with ID ${dto.employeeId} not found`);

      throw new NotFoundException(`Employee with ID ${dto.employeeId} not found`);
    }

    console.log(`Employee ${employee.employeeNumber} validated successfully`);

    const contract = await this.contractModel.findById(contractObjectId).exec();

    if (!contract) {
      console.error(`Contract with ID ${dto.contractId} not found`);

      throw new NotFoundException(`Contract with ID ${dto.contractId} not found`);
    }

    console.log(`Contract ${dto.contractId} validated successfully`);

    const existingRequest = await this.terminationRequestModel
      .findOne({
        employeeId: employeeObjectId,
        status: {
          $in: [TerminationStatus.PENDING, TerminationStatus.UNDER_REVIEW],
        },
      })
      .exec();

    if (existingRequest) {
      console.warn(`Employee ${dto.employeeId} already has an active resignation/termination request`);
      throw new BadRequestException(`You already have an active resignation/termination request with status: ${existingRequest.status}`);
    }

    const resignationRequest = new this.terminationRequestModel({
      employeeId: employeeObjectId,
      contractId: contractObjectId,
      initiator: TerminationInitiation.EMPLOYEE,
      reason: dto.reason,
      employeeComments: dto.employeeComments,
      status: TerminationStatus.PENDING,
      terminationDate: dto.proposedLastWorkingDay,
    });
    const savedResignation = await resignationRequest.save();

    console.log(`Resignation submitted successfully with ID ${savedResignation._id}`);

    //Send notification to line manager for approval (first step in approval workflow)
    // Employee resigning > Line Manager > Financial approval > HR processing/approval
    // Retrieve employee's supervisor/manager from EmployeeProfile schema
    
    let managerNotificationSent = false;

    if (employee.supervisorPositionId) {

      //TODO: what if the supervisor is not found??
      //should i stop the whole workflow untill a supervisor is found?

      console.log(`Preparing notification for line manager approval`);

      const managerNotificationPayload = {
        recipientId: [employeeObjectId], // TODO: Replace with actual manager ID lookup
        type: 'Alert',
        // deliveryType is 'UNICAST' to send to the specific line manager from Notification schema enum
        deliveryType: 'UNICAST',
        // Title indicating resignation approval required
        title: `Resignation Request - ${employee.employeeNumber}`,
        // Message with resignation details for manager review
        message: `Employee ${employee.employeeNumber} has submitted a resignation request.\n\nReason: ${dto.reason}\n\nProposed Last Working Day: ${dto.proposedLastWorkingDay || 'To be determined'}\n\nAction Required: Please review and approve/reject this resignation request. Upon your approval, it will proceed to Financial approval and then HR processing.\n\nWorkflow: Employee > Line Manager (PENDING) > Financial > HR`,
        // relatedEntityId references the resignation request as per Notification schema
        relatedEntityId: savedResignation._id.toString(),
        // relatedModule is 'Recruitment' to identify the source module as per Notification schema
        relatedModule: 'Recruitment',
        // isRead defaults to false as per Notification schema
        isRead: false,
      };

      const managerNotification = new this.notificationModel(
        managerNotificationPayload,
      );
      await managerNotification.save();

      managerNotificationSent = true;
      console.log(`Notification sent to line manager for resignation approval`);
    }
    
    //TODO:
    // after the notification was sent to the manager:

    //financial approval notification will be added
    //notification will be sent to the HR for processing/approval



    //TODO:
     //should the confirmation notification sent to the employee after the approval of all the entities the notification was sent to them in the workflow?

    //Send confirmation notification to employee
    // Using Notification model from employee-subsystem/notification
    const employeeNotificationPayload = {
      // recipientId is the employee who submitted the resignation
      recipientId: [employeeObjectId],
      // Type is 'Info' as this is a confirmation notification from Notification schema enum
      type: 'Info',
      // deliveryType is 'UNICAST' to send only to the employee from Notification schema enum
      deliveryType: 'UNICAST',
      // Title confirming resignation submission
      title: `Resignation Request Submitted`,
      // Message confirming submission and explaining approval workflow
      message: `Your resignation request has been successfully submitted.\n\nRequest ID: ${savedResignation._id}\nStatus: ${savedResignation.status}\nReason: ${dto.reason}\nProposed Last Working Day: ${dto.proposedLastWorkingDay || 'To be determined'}\n\nYour resignation will go through the following approval workflow:\n1. Line Manager Review (CURRENT STEP)\n2. Financial Approval\n3. HR Processing/Approval\n\nYou will be notified at each step. You can track your resignation status at any time.`,
      // relatedEntityId references the resignation request as per Notification schema
      relatedEntityId: savedResignation._id.toString(),
      // relatedModule is 'Recruitment' to identify the source module as per Notification schema
      relatedModule: 'Recruitment',
      // isRead defaults to false as per Notification schema
      isRead: false,
    };

    const employeeNotification = new this.notificationModel(
      employeeNotificationPayload,
    );
    await employeeNotification.save();

    console.log(`Confirmation notification sent to employee`);

    return savedResignation;
  }


  //OFF-019
  //As an Employee, I want to be able to track my resignation request status.

  async trackResignationStatus(dto: TrackResignationStatusDto): Promise<TerminationRequest[]> {
    console.log(`Employee ${dto.employeeId} tracking resignation status`);
    const employeeObjectId = new Types.ObjectId(dto.employeeId);

    const employee = await this.employeeProfileModel
      .findById(employeeObjectId)
      .exec();

    if (!employee) {
      console.error(`Employee with ID ${dto.employeeId} not found`);
      throw new NotFoundException(`Employee with ID ${dto.employeeId} not found`);
    }
    console.log(`Employee ${employee.employeeNumber} validated successfully`);
    
    const resignationRequests = await this.terminationRequestModel
      .find({
        employeeId: employeeObjectId,
        initiator: TerminationInitiation.EMPLOYEE,
      })
      .sort({ createdAt: -1 })
      .exec();

    console.log(`Found ${resignationRequests.length} resignation request(s) for employee ${employee.employeeNumber}`);
    
    //TODO:
    //can the same employee have multiple resignation requests?

    resignationRequests.forEach((request) => {
      console.log(`Resignation ${request._id}: Status = ${request.status}`);
    });

    // Return the array of resignation requests with their current status to the controller
    // Employee can see:
    // - Request ID, creation date, reason
    // - Current status (PENDING, UNDER_REVIEW, APPROVED, REJECTED)
    // - Proposed termination date
    // - Comments from employee and HR
    return resignationRequests;
  }



  

  //OFF-010
  //As HR Manager, I want multi-department exit clearance sign-offs (IT, Finance, Facilities, Line Manager), with statuses, so the employee is fully cleared.

  async processDepartmentSignOff(dto: DepartmentClearanceSignOffDto): Promise<{
    message: string;
    clearanceChecklistId: string;
    department: string;
    status: string;
    approverId: string;
    allDepartmentsApproved: boolean;
    anyDepartmentRejected: boolean;
    pendingDepartments: string[];
    clearanceProgress: {
      total: number;
      approved: number;
      rejected: number;
      pending: number;
    };
  }> {

    console.log(`Department ${dto.department} processing clearance sign-off for checklist ${dto.clearanceChecklistId}`);

    const checklistObjectId = new Types.ObjectId(dto.clearanceChecklistId);
    const approverObjectId = new Types.ObjectId(dto.approverId);

    const clearanceChecklist = await this.clearanceChecklistModel
      .findById(checklistObjectId)
      .exec();

    if (!clearanceChecklist) {
      console.error(`Clearance checklist with ID ${dto.clearanceChecklistId} not found`);
      throw new NotFoundException(`Clearance checklist with ID ${dto.clearanceChecklistId} not found`);
    }

    console.log(`Clearance checklist ${dto.clearanceChecklistId} validated successfully`);

    const departmentItem = clearanceChecklist.items.find(
      (item) => item.department === dto.department,
    );

    if (!departmentItem) {
      console.error(`Department ${dto.department} not found in clearance checklist items`);
      throw new NotFoundException(
        `Department ${dto.department} not found in clearance checklist items. Available departments: ${clearanceChecklist.items.map((item) => item.department).join(', ')}`,
      );
    }


    console.log(`Department item found for ${dto.department}. Current status: ${departmentItem.status}`);

    const previousStatus = departmentItem.status;

    departmentItem.status = dto.status; // Set new status (APPROVED, REJECTED, or PENDING)
    departmentItem.updatedBy = approverObjectId; // Track who made the approval/rejection
    departmentItem.updatedAt = new Date(); 

    if (dto.comments) {
      departmentItem.comments = dto.comments;
    }

    await clearanceChecklist.save();

    console.log(`Department ${dto.department} sign-off updated from ${previousStatus} to ${dto.status}`);

    // Calculate overall clearance progress across all departments
    // Check if all departments have approved their clearance items
    const allDepartmentsApproved = clearanceChecklist.items.every(
      (item) => item.status === ApprovalStatus.APPROVED,
    );

    // Check if any department has rejected their clearance items
    const anyDepartmentRejected = clearanceChecklist.items.some(
      (item) => item.status === ApprovalStatus.REJECTED,
    );

    // Get list of departments still pending approval
    const pendingDepartments = clearanceChecklist.items
      .filter((item) => item.status === ApprovalStatus.PENDING)
      .map((item) => item.department);

    // Calculate clearance progress statistics
    const totalDepartments = clearanceChecklist.items.length;
    const approvedCount = clearanceChecklist.items.filter(
      (item) => item.status === ApprovalStatus.APPROVED,
    ).length;
    const rejectedCount = clearanceChecklist.items.filter(
      (item) => item.status === ApprovalStatus.REJECTED,
    ).length;
    const pendingCount = clearanceChecklist.items.filter(
      (item) => item.status === ApprovalStatus.PENDING,
    ).length;

    console.log(`Clearance progress: ${approvedCount}/${totalDepartments} approved, ${rejectedCount} rejected, ${pendingCount} pending`);

    //Retrieve termination request to get employee information for notifications
    // Using TerminationRequest model from Recruitment models
    const terminationRequest = await this.terminationRequestModel
      .findById(clearanceChecklist.terminationId)
      .exec();

    if (!terminationRequest) {
      console.warn(`Termination request ${clearanceChecklist.terminationId} not found. Skipping notifications.`);
    } else {
      //Send notification to employee about the department sign-off decision
      // Using Notification model from employee-subsystem/notification
      const employeeNotificationPayload = {
        // recipientId is the employee going through offboarding
        recipientId: [terminationRequest.employeeId],
        // Type depends on approval status: 'Alert' for rejection, 'Info' for approval
        type: dto.status === ApprovalStatus.REJECTED ? 'Alert' : 'Info',
        // deliveryType is 'UNICAST' to send only to the employee from Notification schema enum
        deliveryType: 'UNICAST',
        // Title indicating department clearance status
        title: `Exit Clearance Update: ${dto.department} - ${dto.status}`,
        // Message with department sign-off details and next steps
        message: `Your exit clearance for ${dto.department} has been ${dto.status.toLowerCase()}.\n\n${dto.comments ? `Comments from ${dto.department}: ${dto.comments}\n\n` : ''}Clearance Progress:\n- Total Departments: ${totalDepartments}\n- Approved: ${approvedCount}\n- Rejected: ${rejectedCount}\n- Pending: ${pendingCount}\n\n${pendingDepartments.length > 0 ? `Pending Departments: ${pendingDepartments.join(', ')}\n\n` : ''}${allDepartmentsApproved ? 'Congratulations! You have received clearance from all departments. Your offboarding process is complete.' : anyDepartmentRejected ? 'Please resolve rejected clearance items to proceed with your offboarding.' : 'Please continue to work with pending departments to complete your clearance.'}`,
        // relatedEntityId references the clearance checklist as per Notification schema
        relatedEntityId: clearanceChecklist._id.toString(),
        // relatedModule is 'Recruitment' to identify the source module as per Notification schema
        relatedModule: 'Recruitment',
        // isRead defaults to false as per Notification schema
        isRead: false,
      };

      // Create and save the employee notification
      const employeeNotification = new this.notificationModel(
        employeeNotificationPayload,
      );
      await employeeNotification.save();

      console.log(`Department sign-off notification sent to employee`);

      //If all departments approved, send final clearance completion notification
      if (allDepartmentsApproved) {
        const completionNotificationPayload = {
          // recipientId includes the employee and HR managers for final processing
          recipientId: [terminationRequest.employeeId], // TODO: Add HR manager IDs
          // Type is 'Alert' as this is a critical milestone from Notification schema enum
          type: 'Alert',
          // deliveryType is 'MULTICAST' to send to employee and HR from Notification schema enum
          deliveryType: 'MULTICAST',
          // Title indicating full clearance achieved
          title: `Full Exit Clearance Achieved`,
          // Message with complete clearance confirmation and next steps
          message: `Employee has successfully received clearance from all departments.\n\nDepartments Cleared:\n${clearanceChecklist.items.map((item) => `- ${item.department}: ${item.status} by ${item.updatedBy} on ${item.updatedAt?.toISOString()}`).join('\n')}\n\nNext Steps:\n1. Process final settlement and benefits termination\n2. Collect all company property and equipment\n3. Complete final pay calculations\n4. Issue termination letter and certificates\n\nThe employee is fully cleared and ready for final offboarding processing.`,
          // relatedEntityId references the clearance checklist as per Notification schema
          relatedEntityId: clearanceChecklist._id.toString(),
          relatedModule: 'Recruitment',
          // isRead defaults to false as per Notification schema
          isRead: false,
        };

        const completionNotification = new this.notificationModel(
          completionNotificationPayload,
        );
        await completionNotification.save();

        console.log(`Full clearance completion notification sent`);
      }

      //If any department rejected, send alert to HR for intervention
      if (
        dto.status === ApprovalStatus.REJECTED &&
        previousStatus !== ApprovalStatus.REJECTED
      ) {
        const rejectionAlertPayload = {
          // recipientId should be HR managers for intervention
          recipientId: [terminationRequest.employeeId], // TODO: Replace with actual HR manager IDs
          // Type is 'Alert' as this requires HR intervention from Notification schema enum
          type: 'Alert',
          // deliveryType is 'MULTICAST' to send to multiple HR personnel from Notification schema enum
          deliveryType: 'MULTICAST',
          // Title indicating rejection requiring attention
          title: `Exit Clearance Rejection: ${dto.department}`,
          // Message with rejection details for HR intervention
          message: `Department ${dto.department} has rejected the exit clearance.\n\nEmployee: ${terminationRequest.employeeId}\nDepartment: ${dto.department}\nStatus: ${dto.status}\nRejection Reason: ${dto.comments || 'Not specified'}\n\nAction Required: Please coordinate with ${dto.department} to resolve the clearance issues and facilitate the employee's offboarding process.\n\nClearance Progress:\n- Approved: ${approvedCount}\n- Rejected: ${rejectedCount}\n- Pending: ${pendingCount}`,
          // relatedEntityId references the clearance checklist as per Notification schema
          relatedEntityId: clearanceChecklist._id.toString(),
          // relatedModule is 'Recruitment' to identify the source module as per Notification schema
          relatedModule: 'Recruitment',
          // isRead defaults to false as per Notification schema
          isRead: false,
        };

        // Create and save the rejection alert notification
        const rejectionAlert = new this.notificationModel(rejectionAlertPayload);
        await rejectionAlert.save();

        console.log(`Rejection alert sent to HR for ${dto.department}`);
      }
    }
    console.log(`Department sign-off processing completed successfully for ${dto.department}`);

    // Return comprehensive clearance status to the controller
    return {
      message: `Department ${dto.department} sign-off processed successfully`,
      clearanceChecklistId: clearanceChecklist._id.toString(),
      department: dto.department,
      status: dto.status,
      approverId: dto.approverId,
      allDepartmentsApproved: allDepartmentsApproved,
      anyDepartmentRejected: anyDepartmentRejected,
      pendingDepartments: pendingDepartments,
      clearanceProgress: {
        total: totalDepartments,
        approved: approvedCount,
        rejected: rejectedCount,
        pending: pendingCount,
      },
    };
  }
}
