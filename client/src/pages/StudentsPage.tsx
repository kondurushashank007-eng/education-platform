import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { Student } from '../types';
import { StudentRosterTable } from '../components/students/StudentRosterTable';
import { BarrierDiagnosticModal } from '../components/students/BarrierDiagnosticModal';
import { TelemetryCheckpointModal } from '../components/students/TelemetryCheckpointModal';
import { useAuth } from '../context/AuthContext';

export const StudentsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { school } = useAuth();

  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isIntakeModalOpen, setIsIntakeModalOpen] = useState<boolean>(false);
  const [selectedStudentForTelemetry, setSelectedStudentForTelemetry] = useState<Student | null>(null);

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    grade: searchParams.get('grade') || '',
    barrier: searchParams.get('barrier') || 'all',
    risk: searchParams.get('risk') || 'all',
    iep: searchParams.get('iep') || ''
  });

  const loadStudents = async () => {
    setIsLoading(true);
    try {
      const res = await api.students.list(filters);
      setStudents(res.students);
    } catch (err) {
      console.error('Failed to load students roster:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, [filters, school?.id]);

  return (
    <div className="space-y-6">
      <StudentRosterTable
        students={students}
        isLoading={isLoading}
        onOpenIntakeModal={() => setIsIntakeModalOpen(true)}
        onQuickLogTelemetry={(student) => setSelectedStudentForTelemetry(student)}
        filters={filters}
        setFilters={setFilters}
      />

      {/* Barrier Diagnostic & Intake Modal */}
      <BarrierDiagnosticModal
        isOpen={isIntakeModalOpen}
        onClose={() => setIsIntakeModalOpen(false)}
        onStudentCreated={(newStudent) => {
          setStudents(prev => [newStudent, ...prev]);
        }}
      />

      {/* Telemetry Checkpoint Modal */}
      <TelemetryCheckpointModal
        student={selectedStudentForTelemetry}
        isOpen={Boolean(selectedStudentForTelemetry)}
        onClose={() => setSelectedStudentForTelemetry(null)}
        onTelemetryRecorded={(newTelemetry) => {
          setStudents(prev => prev.map(s => {
            if (s.id === newTelemetry.student_id) {
              return {
                ...s,
                latest_telemetry: newTelemetry
              };
            }
            return s;
          }));
        }}
      />
    </div>
  );
};

