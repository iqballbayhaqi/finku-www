import React, { useEffect, useRef } from 'react';
import { Button, Space, Tooltip } from 'antd';
import { BoldOutlined, ItalicOutlined, UnderlineOutlined, LinkOutlined } from '@ant-design/icons';

interface RichTextEditorProps {
    value?: string;
    onChange?: (value: string) => void;
    placeholder?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange }) => {
    const editorRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (editorRef.current && value !== editorRef.current.innerHTML) {
             // Only update if content is different to avoid cursor jumps
             if (value === undefined || value === null) {
                 editorRef.current.innerHTML = '';
             } else {
                 editorRef.current.innerHTML = value;
             }
        }
    }, [value]);

    const handleInput = () => {
        if (editorRef.current && onChange) {
            onChange(editorRef.current.innerHTML);
        }
    };

    const execCommand = (command: string, value: string | undefined = undefined) => {
        document.execCommand(command, false, value);
        editorRef.current?.focus();
    };

    const handleLink = () => {
        const url = prompt('Enter URL:');
        if (url) {
            execCommand('createLink', url);
        }
    };

    return (
        <div style={{ border: '1px solid #d9d9d9', borderRadius: 6, overflow: 'hidden' }}>
            <div style={{ background: '#fafafa', padding: '8px', borderBottom: '1px solid #f0f0f0', display: 'flex', gap: 8 }}>
                <Space>
                    <Tooltip title="Bold">
                        <Button size="small" icon={<BoldOutlined />} onClick={() => execCommand('bold')} />
                    </Tooltip>
                    <Tooltip title="Italic">
                        <Button size="small" icon={<ItalicOutlined />} onClick={() => execCommand('italic')} />
                    </Tooltip>
                    <Tooltip title="Underline">
                        <Button size="small" icon={<UnderlineOutlined />} onClick={() => execCommand('underline')} />
                    </Tooltip>
                    <Tooltip title="Link">
                        <Button size="small" icon={<LinkOutlined />} onClick={handleLink} />
                    </Tooltip>
                </Space>
            </div>
            <div
                ref={editorRef}
                contentEditable
                onInput={handleInput}
                style={{ 
                    minHeight: 100, 
                    padding: '8px 12px', 
                    outline: 'none',
                    cursor: 'text'
                }}
            />
        </div>
    );
};

export default RichTextEditor;
