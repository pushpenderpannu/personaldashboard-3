import React, { useState, useEffect } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { Box, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import MainLayout from '../components/layout/MainLayout';
import WidgetWrapper from '../components/widgets/WidgetWrapper';
import AddWidgetModal from '../components/widgets/AddWidgetModal';
import axios from 'axios'; // We'll need axios for API calls
import { useAuth } from '../context/AuthContext';

import TaskListWidget from '../components/widgets/TaskListWidget';

import WeatherWidget from '../components/widgets/WeatherWidget';

import NewsWidget from '../components/widgets/NewsWidget';

import StocksWidget from '../components/widgets/StocksWidget';

import TweetsWidget from '../components/widgets/TweetsWidget';

import CalendarWidget from '../components/widgets/CalendarWidget';

// Placeholder Widget Components (to be replaced with actual implementations)
const PlaceholderWidget = ({ type }) => <Box>Widget of type: {type}</Box>;

const widgetMap = {
  TaskList: TaskListWidget,
  Calendar: CalendarWidget,
  Weather: WeatherWidget,
  News: NewsWidget,
  Stocks: StocksWidget,
  Tweets: TweetsWidget,
};

const ResponsiveGridLayout = WidthProvider(Responsive);

const DashboardPage = () => {
  const { user } = useAuth();
  const [layouts, setLayouts] = useState({});
  const [widgets, setWidgets] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getAuthHeader = () => ({ headers: { Authorization: `Bearer ${user.token}` } });

  useEffect(() => {
    // Fetch widget configurations from the backend
    const fetchWidgets = async () => {
      try {
        const { data } = await axios.get('/api/widgets', getAuthHeader());
        setWidgets(data);
        // Convert backend layout format to react-grid-layout format
        const newLayouts = { lg: data.map(w => w.layout) };
        setLayouts(newLayouts);
      } catch (error) {
        console.error('Failed to fetch widgets:', error);
      }
    };
    if (user) fetchWidgets();
  }, [user]);

  const onLayoutChange = async (layout, allLayouts) => {
    // Only save layout if it has changed to avoid unnecessary API calls
    if (JSON.stringify(layouts) !== JSON.stringify(allLayouts)) {
      setLayouts(allLayouts);
      try {
        await axios.put('/api/widgets/layout', allLayouts.lg, getAuthHeader());
      } catch (error) {
        console.error('Failed to save layout:', error);
      }
    }
  };

  const handleAddWidget = async (widgetData) => {
    const instanceId = `${widgetData.widgetType}-${Date.now()}`;
    const newWidget = {
      instanceId: instanceId,
      widgetType: widgetData.widgetType,
      config: widgetData.config,
      aiPrompt: widgetData.aiPrompt,
      layout: {
        i: instanceId,
        x: (widgets.length * 28) % 84, y: Infinity, w: 28, h: 2,
      },
    };

    try {
        const { data } = await axios.post('/api/widgets', newWidget, getAuthHeader());
        setWidgets([...widgets, data]);
        setLayouts({ lg: [...layouts.lg, data.layout] });
    } catch (error) {
        console.error('Failed to add widget:', error);
    }
  };

  const handleDeleteWidget = async (instanceId) => {
    try {
      await axios.delete(`/api/widgets/${instanceId}`, getAuthHeader());
      setWidgets(widgets.filter(w => w.instanceId !== instanceId));
      setLayouts({ lg: layouts.lg.filter(l => l.i !== instanceId) });
    } catch (error)      {
      console.error('Failed to delete widget:', error);
    }
  };

  const handleUpdateWidgetSettings = async (instanceId, newSettings) => {
     try {
      const { data } = await axios.put(`/api/widgets/${instanceId}`, newSettings, getAuthHeader());
      setWidgets(widgets.map(w => w.instanceId === instanceId ? data : w));
    } catch (error) {
      console.error('Failed to update widget settings:', error);
    }
  };

  return (
    <MainLayout>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setIsModalOpen(true)}>
          Add Widget
        </Button>
      </Box>
      <AddWidgetModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddWidget={handleAddWidget}
      />
      <ResponsiveGridLayout
        layouts={layouts}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 84, md: 70, sm: 42, xs: 28, xxs: 14 }}
        rowHeight={100}
        onLayoutChange={onLayoutChange}
        draggableHandle=".widget-drag-handle" // Optional: class for a drag handle
      >
        {widgets.map((widget) => {
          const WidgetComponent = widgetMap[widget.widgetType] || PlaceholderWidget;
          return (
            <div key={widget.instanceId}>
              <WidgetWrapper
                title={widget.widgetType}
                settings={{...widget.config, aiPrompt: widget.aiPrompt}}
                onSettingsChange={(newSettings) => handleUpdateWidgetSettings(widget.instanceId, newSettings)}
                onDelete={() => handleDeleteWidget(widget.instanceId)}
              >
                  <WidgetComponent config={widget.config} aiPrompt={widget.aiPrompt} />
              </WidgetWrapper>
            </div>
          );
        })}
      </ResponsiveGridLayout>
    </MainLayout>
  );
};

export default DashboardPage;
