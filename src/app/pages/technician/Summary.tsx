import { useParams } from 'react-router';
import SummaryContent from '../../components/SummaryContent';

export default function TechnicianSummary() {
  const { id } = useParams();
  
  return (
    <SummaryContent patientId={id} role="technician" />
  );
}
