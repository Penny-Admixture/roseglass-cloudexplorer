import React from 'react';
import './RemoteSelector.css';

interface RemoteSelectorProps {
  remotes: string[];
  selectedRemote: string;
  onRemoteChange: (remote: string) => void;
  label: string;
}

const RemoteSelector: React.FC<RemoteSelectorProps> = ({
  remotes,
  selectedRemote,
  onRemoteChange,
  label
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onRemoteChange(e.target.value);
  };

  return (
    <div className="remote-selector">
      <label className="remote-label">{label}:</label>
      <select
        value={selectedRemote}
        onChange={handleChange}
        className="remote-select"
      >
        <option value="">Local Filesystem</option>
        {remotes.map(remote => (
          <option key={remote} value={remote}>
            {remote}
          </option>
        ))}
      </select>
    </div>
  );
};

export default RemoteSelector;
